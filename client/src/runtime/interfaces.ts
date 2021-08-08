import * as constants from './constants/index';
import { BigNumber, ContractTransaction } from 'ethers';

export type NetworkName = 'ropsten' | 'rinkeby' | 'mainnet' | 'goerli' | 'kovan' | 'prater' | 'local';

export interface Network {
    name: NetworkName,
    deployed: boolean,
    correct_subdomain: boolean,
    expects: NetworkName,
    color: string
};

export interface PendingTransaction {
    tx: ContractTransaction,
    method: string
};

export interface Ethereum {
    pending_transactions: Array<PendingTransaction>,
    add_pending_transaction: (pending_transaction: PendingTransaction) => void,
    remove_pending_transaction: (tx_hash: string) => void,
    connect_metamask: Function,
    dry_connect_metamask: Function,
    connected_address: string,
    connected: boolean,
    connected_chain_id: string,
    connected_network: Network,
    web3: any,
    signer: any,
    connection_loading: boolean,
    page_loading: boolean
};

export type TaskAction = 'loading' | 'claim_income' | 'confirm_withdrawal' | 'increase_stake' | '' | undefined

export interface RethCollateral {
    loading: boolean,
    reload: Function,
    total: number
}

export interface Staker {
    blocks_until_withdrawals_allowed: number,
    withdrawals_allowed: boolean,
    deposit_delay: number,
    blocks_passed: number,
    staked_eth: number,
    account_eth: number
};

export interface Validators {
    is_valid_address: (address: string) => boolean,
    is_valid_withdrawal_delay: (num: number) => boolean,
    is_valid_increase_stake_total: (num: BigNumber) => boolean,
    is_valid_stake_to_withdraw: (num: BigNumber) => boolean,
    is_valid_deposit_reward: (num: BigNumber) => boolean
}

export interface Account {
    loading: boolean,
    reload: Function,
    staker: Staker,
    total_reth: Number
}

export interface Toast {
    success: (text: string) => any,
    error: (text: string) => any
};

export interface Task {
    set: (action: TaskAction, args: Array<any>) => any,
    action: TaskAction,
    args: Array<any>,
    loading: boolean,
    set_loading: Function
};

export interface Dimensions {
    width: number,
    height: number
};

export interface Settings {
    set: Function,
    show: boolean
}

export interface Queries {
    clear: () => void,
    remove: (key: string) => void,
    add: (key: string, val: any) => void,
    params: { [key: string]: string }
}

export interface Runtime {
    reth_collateral: RethCollateral,
    ethereum: Ethereum,
    queries: Queries,
    hardhat: any | null,
    constants: typeof constants,
    dimensions: Dimensions,
    account: Account,
    validators: Validators,
    toast: Toast,
    settings: Settings,
    task: Task
};