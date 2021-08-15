import { useState, useEffect } from 'react';
import * as constants from '../constants/index';
import * as deployments from '../../deployments/index';
import { ethers, ContractReceipt } from 'ethers';
import type {
    Ethereum,
    NetworkName,
    Runtime,
    PastTransaction,
    PastTransactionStatus
} from '../interfaces';

const is_fresh = (past_transaction: PastTransaction) => {
    return (Date.now() - past_transaction.modified_at) < 3.6e+6
};

const map_subdomain_to_network = (): NetworkName => {
    const subdomain = window.location.host.split('.')[0];
    if (
        subdomain === 'kovan'
        || subdomain === 'ropsten'
        || subdomain === 'rinkeby'
        || subdomain === 'goerli'
    ) {
        return subdomain;
    }
    if (subdomain === 'prater') {
        return 'goerli';
    }
    if (subdomain === 'www' || subdomain === 'mainnet') {
        return 'mainnet';
    }
    if (window.location.host.startsWith('localhost')) {
        return 'local';
    }
    if (window.location.host.split('.').length === 2) {
        return 'mainnet';
    }
    return 'local';
};

const map_chain_id = (chain_id: any) => {
    if (!!Number(chain_id) && chain_id.length > 9) {
        return 'local';
    }
    switch (chain_id) {
        case '1': return 'mainnet';
        case '3': return 'ropsten';
        case '4': return 'rinkeby';
        case '5': return 'goerli';
        case '42': return 'kovan';
        case '1337': return 'local';
        default: return `local`; // i'm not sure if this is the best way to handle this???
    }
};

const use_ethereum = (runtime: Pick<Runtime, 'queries'>): Ethereum => {
    const {
        queries
    } = runtime;
    const [web3, setWeb3] = useState<any>(null);
    const [signer, setSigner] = useState<any>(null);
    const [connected_address, setConnectedAddress] = useState('');
    const [connection_loading, setConnectionLoading] = useState(true);
    const [page_loading, setPageLoading] = useState(true);
    const [connected_chain_id, setConnectedChainId] = useState('');
    const [connected_network_name, setConnectedNetworkName] = useState<NetworkName>(map_subdomain_to_network());
    const { color } = (constants.networks[connected_chain_id] || constants.networks['5']);
    const past_transactions_storage_key = (connected_network_name + '-' + connected_address + '-ethereum-past-transactions').toLowerCase();
    const [past_transactions, setPastTransactions] = useState<Array<PastTransaction>>(
        JSON.parse(window.localStorage.getItem(past_transactions_storage_key) || "[]")
            .filter((past_transaction: PastTransaction) => is_fresh(past_transaction))
    );
    const clear_data = async () => {
        setWeb3(null);
        setSigner(null);
        setConnectedAddress('');
        setConnectedChainId('');
        setConnectedNetworkName('goerli');
    };
    const dry_connect_metamask = async () => {
        const web3 = new ethers.providers.Web3Provider(window.ethereum, 'any');
        web3.send("eth_requestAccounts", []);
        connect_metamask(null);
    };
    const connect_metamask = async (_accounts: Array<any> | null) => {
        if (typeof window.ethereum === 'undefined') {
            clear_data();
            return setPageLoading(false);
        }
        setConnectionLoading(true);
        try {
            const _web3 = new ethers.providers.Web3Provider(window.ethereum, 'any');
            if (!_web3) {
                clear_data();
            }
            setWeb3(_web3);
            setSigner(_web3.getSigner());
            const accounts = Array.isArray(_accounts) ? _accounts : await _web3.listAccounts();
            if (accounts.length && accounts.length === 0) {
                throw new Error('No accounts found');
            }
            setConnectedAddress(typeof accounts[0] === 'string' ? accounts[0] : '');
            const chain_id = await window.ethereum.request({
                method: 'net_version',
                params: []
            });
            setConnectedChainId(chain_id);
            setConnectedNetworkName(map_chain_id(chain_id));
        } catch (err) {
            console.log(err);
            clear_data();
        } finally {
            setConnectionLoading(false);
            setPageLoading(false);
        }
    };
    const set_past_transaction_status = (tx_hash: string, status: PastTransactionStatus) => {
        const transition_func = (_past_transactions: Array<PastTransaction>) => _past_transactions.map(
            _past_transaction => _past_transaction.hash === tx_hash
                ? Object.assign({}, _past_transaction, { status, modified_at: Date.now() }) 
                : _past_transaction
        );
        const found_past_transactions = JSON.parse(window.localStorage.getItem(past_transactions_storage_key) || "[]")
        window.localStorage.setItem(
            past_transactions_storage_key, 
            JSON.stringify(
                transition_func(found_past_transactions)
            )
        );
        setPastTransactions((_past_transactions) => transition_func(_past_transactions))
    };
    const add_past_transaction = (pending_transaction: PastTransaction) => {
        const found_past_transactions = JSON.parse(window.localStorage.getItem(past_transactions_storage_key) || "[]")
        window.localStorage.setItem(
            past_transactions_storage_key, 
            JSON.stringify(
                found_past_transactions
                    .filter((found_past_transaction: PastTransaction) => found_past_transaction.hash !== pending_transaction.hash)
                    .concat([pending_transaction])
            )
        );
        setPastTransactions(_past_transactions =>
            _past_transactions
                .filter(_pending_transaction => _pending_transaction.hash !== pending_transaction.hash)
                .concat([pending_transaction])
        );
        let interval = setInterval(() => check_and_handle_tx_status(
            pending_transaction,
            () => clearInterval(interval)
        ), 2500);
    };
    const check_and_handle_tx_status = async (pending_transaction: PastTransaction, func: Function) => {
        const _web3 = new ethers.providers.Web3Provider(window.ethereum, 'any');
        if (_web3) {
            const receipt: ContractReceipt = await _web3.getTransactionReceipt(pending_transaction.hash);
            if (receipt && receipt.blockNumber) {
                set_past_transaction_status(pending_transaction.hash, 'succeeded');
                queries.add('success_message', pending_transaction.success_message);
                queries.reload_data(func);
            }
            if (receipt && receipt.status === 0) {
                set_past_transaction_status(pending_transaction.hash, 'failed');
                func();
            } // 'https://ropsten.etherscan.io/address/0x4ae0ddd4be0094a52af8bbb6c8afb1ede6a29c3a?a=0xb89282e1ae6e496a4817298e8bf2e5cbf5a4b770'
        }
    };
    useEffect(() => {
        const parsed_past_transactions = JSON.parse(window.localStorage.getItem(past_transactions_storage_key) || "[]");
        parsed_past_transactions.forEach((parsed_past_transaction: PastTransaction) => {
            if (parsed_past_transaction.status === 'pending') {
                let interval = setInterval(() => check_and_handle_tx_status(
                    parsed_past_transaction,
                    () => clearInterval(interval)
                ), 2500);
            }
        })
        setPastTransactions(
            parsed_past_transactions
        );
    }, [past_transactions_storage_key])
    useEffect(() => {
        connect_metamask(null);
        if (typeof window.ethereum === 'undefined') {
            return;
        }
        window.ethereum.on('accountsChanged', (accounts: Array<any>) => {
            setPageLoading(true);
            queries.clear();
            connect_metamask(accounts);
        });
        window.ethereum.on('chainChanged', (chain_id: any) => {
            setPageLoading(true);
            queries.clear();
            connect_metamask(null);
        });
        window.ethereum.on('connect', (chain_id: any) => {
            setPageLoading(true);
            connect_metamask(null);
        });
        window.ethereum.on('disconnect', (chain_id: any) => {
            setPageLoading(true);
            queries.clear();
            clear_data();
            setConnectionLoading(false);
            setPageLoading(false);
        });
    }, []);
    return {
        past_transactions,
        add_past_transaction,
        set_past_transaction_status,
        connection_loading,
        page_loading,
        connect_metamask,
        dry_connect_metamask,
        connected_address,
        connected: connected_address.length > 0,
        connected_chain_id,
        connected_network: {
            name: connected_network_name,
            expects: map_subdomain_to_network(),
            correct_subdomain: connected_network_name === map_subdomain_to_network(),
            deployed: !(
                String(deployments.networks[connected_network_name]) === 'null'
                || Object.keys(deployments.networks[connected_network_name]).length === 0
            ),
            color
        },
        web3,
        signer
    }
};

export default use_ethereum;