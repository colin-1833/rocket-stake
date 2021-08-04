import { useState, useEffect } from 'react';
import * as constants from '../constants/index';
import { toast } from './index'
import type {
  Ethereum,
  NetworkName,
  Runtime,
  PendingTransaction
} from '../interfaces';
import {
  networks as deployment_networks
} from '../../deployments/index';
import { ethers, ContractReceipt } from 'ethers';

const map_subdomain_to_network = (): NetworkName => {
  const subdomain = window.location.host.split('.')[0];
  if (subdomain === 'www' || subdomain === 'mainnet') {
    return 'mainnet';
  }
  return 'goerli';
};

const map_chain_id = (chain_id: any) => {
  if (!!Number(chain_id) && chain_id.length > 9) {
    return 'goerli';
  }
  switch (chain_id) {
    case '1' : return 'mainnet';
    case '5' : return 'goerli';
    default  : return `goerli`; // i'm not sure if this is the best way to handle this???
  }
};

const use_ethereum = (runtime: Pick<Runtime, 'queries'>): Ethereum => {
  const {
    queries
  } = runtime;
  const [web3, setWeb3] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [pending_transactions, setPendingTransactions] = useState<Array<PendingTransaction>>([]);
  const [connected_address, setConnectedAddress] = useState('');
  const [connection_loading, setConnectionLoading] = useState(true);
  const [page_loading, setPageLoading] = useState(true);
  const [connected_chain_id, setConnectedChainId] = useState('');
  const [connected_network_name, setConnectedNetworkName] = useState<NetworkName>('goerli');
  const { color } = (constants.networks[connected_chain_id] || constants.networks['5']);
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
  const connect_metamask = async (_accounts: Array<any>|null) => {
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
      const _connected_address = typeof accounts[0] === 'string' ? accounts[0] : '';
      setConnectedAddress(_connected_address);
      const chain_id = await window.ethereum.request({
        method: 'net_version',
        params: []
      });
      setConnectedChainId(chain_id);
      setConnectedNetworkName(map_chain_id(chain_id));
    } catch(err) {
      console.log(err);
      clear_data();
    } finally {
      setConnectionLoading(false);
      setPageLoading(false);
    }
  };
  const remove_non_pending_transaction_queries = async (func: Function) => {
    const _web3 = new ethers.providers.Web3Provider(window.ethereum, 'any');
    if (_web3) {
      const receipt: ContractReceipt = await _web3.getTransactionReceipt(queries.params.pending_tx);
      if (receipt && receipt.blockNumber) {
        if (queries.params.pending_tx_success_message) {
          toast.success(queries.params.pending_tx_success_message);
          func();
        }
        queries.remove('successful_tx');
        queries.add('successful_tx', queries.params.pending_tx);
        queries.add('successful_tx_method', queries.params.pending_tx_method);
        queries.remove('pending_tx');
        queries.remove('pending_tx_method');
        queries.remove('pending_tx_success_message');
        queries.remove('pending_tx_success');
      }
    }
  };
  useEffect(() => {
    if (queries.params.pending_tx && String(queries.params.pending_tx_success) !== 'true') {
      let interval = setInterval(() => {
        if (String(queries.params.pending_tx_success) !== 'true') {
          remove_non_pending_transaction_queries(() => clearInterval(interval));
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [queries.params.pending_tx]);
  useEffect(() => {
    if (String(queries.params.pending_tx_success) === 'true') {
      queries.remove('pending_tx');
      queries.remove('pending_tx_method');
      queries.remove('pending_tx_success_message');
      queries.remove('pending_tx_success');
    }
  }, []);
  useEffect(() => {
    if (pending_transactions.length > 0) {
      queries.remove('successful_tx');
      queries.remove('successful_tx_method');
      queries.add(
        'pending_tx',
        pending_transactions.slice().reverse()[0].tx.hash
      );
      queries.add(
        'pending_tx_method',
        pending_transactions.slice().reverse()[0].method
      );
    }
  }, [pending_transactions.length])
  useEffect(() => {
    connect_metamask(null);
    if (typeof window.ethereum === 'undefined') {
      return;
    }
    window.ethereum.on('accountsChanged', (accounts: Array<any>) => {
      setPageLoading(true);
      connect_metamask(accounts);
    });
    window.ethereum.on('chainChanged', (chain_id: any) => {
      setPageLoading(true);
      connect_metamask(null);
    });
    window.ethereum.on('connect', (chain_id: any) => {
      setPageLoading(true);
      connect_metamask(null);
    });
    window.ethereum.on('disconnect', (chain_id: any) => {
      setPageLoading(true);
      clear_data();
      setConnectionLoading(false);
      setPageLoading(false);
    });
  }, []);
  const add_pending_transaction = (pending_transaction: PendingTransaction) => {
    setPendingTransactions(_pending_transactions => 
      _pending_transactions
        .filter(_pending_transaction => _pending_transaction.tx.hash !== pending_transaction.tx.hash)
        .concat([pending_transaction])
    );
  };
  const remove_pending_transaction = (tx_hash: string) => {
    setPendingTransactions(_pending_transactions => 
      _pending_transactions
        .filter(_pending_transaction => _pending_transaction.tx.hash !== tx_hash)
    );
  };
  return {
    pending_transactions,
    add_pending_transaction,
    remove_pending_transaction,
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
        String(deployment_networks[connected_network_name]) === 'null' 
        || Object.keys(deployment_networks[connected_network_name]).length === 0
      ),
      color
    },
    web3,
    signer
  }
};

export default use_ethereum;