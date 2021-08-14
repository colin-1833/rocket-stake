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
    const [connected_network_name, setConnectedNetworkName] = useState<NetworkName>('goerli');
    const { color } = (constants.networks[connected_chain_id] || constants.networks['5']);
    const past_transactions_storage_key = connected_address + '-ethereum-past-transactions';
    const [past_transactions, setPastTransactions] = useState<Array<PastTransaction>>([]);
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
    const set_past_transaction_status = (tx_hash: string, status: PastTransactionStatus) => setPastTransactions((past_transactions) => past_transactions.map(
        past_transaction => past_transaction.hash === tx_hash
            ? Object.assign({}, past_transaction, { status, modified_at: Date.now() }) 
            : past_transaction
    ));
    const remove_non_pending_transaction_queries = async (func: Function) => {
        const _web3 = new ethers.providers.Web3Provider(window.ethereum, 'any');
        if (_web3) {
            const receipt: ContractReceipt = await _web3.getTransactionReceipt(queries.params.pending_tx);
            if (receipt && receipt.blockNumber) {
                if (queries.params.pending_tx_success_message) {
                    queries.add('success_message', queries.params.pending_tx_success_message);
                    queries.remove('pending_tx');
                    queries.remove('pending_tx_method');
                    queries.remove('pending_tx_success_message');
                }
                set_past_transaction_status(queries.params.pending_tx, 'succeeded');
            }
            if (receipt && receipt.status === 0) {
                set_past_transaction_status(queries.params.pending_tx, 'failed');
                func();
            }
        }
    };
    useEffect(() => {
        if (connected_address) {
            if (localStorage.getItem(past_transactions_storage_key)) {
                JSON.parse(String(localStorage.getItem(past_transactions_storage_key)))
                    .forEach((past_transaction: PastTransaction) => add_past_transaction(past_transaction))
            }
        }
    }, [connected_address])
    useEffect(() => {
        if (queries.params.pending_tx) {
            add_past_transaction({ 
                status: 'pending', 
                hash: queries.params.pending_tx, 
                method: queries.params.pending_tx_method ,
                modified_at: Date.now()
            });
        }
    }, []);
    useEffect(() => {
        if (queries.params.pending_tx) {
            let interval = setInterval(() => remove_non_pending_transaction_queries(
                () => clearInterval(interval)
            ), 2500);
            return () => clearInterval(interval);
        }
    }, [queries.params.pending_tx]);
    useEffect(() => {
        if (
            past_transactions.length > 0 
            && past_transactions.some(past_transaction => past_transaction.status === 'pending')
        ) {
            queries.add('pending_tx', past_transactions.slice().reverse()[0].hash);
            queries.add('pending_tx_method', past_transactions.slice().reverse()[0].method);
        }
    }, [past_transactions.length]);
    useEffect(() => {
        if (connected_address) {
            window.localStorage.setItem(
                past_transactions_storage_key, 
                JSON.stringify(past_transactions.filter(past_transaction => is_fresh(past_transaction)))
            );
        }
    }, [JSON.stringify(past_transactions), connected_address])
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
    const add_past_transaction = (pending_transaction: PastTransaction) => {
        setPastTransactions(_past_transactions =>
            _past_transactions
                .filter(_pending_transaction => _pending_transaction.hash !== pending_transaction.hash)
                .concat([pending_transaction])
        );
    };
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