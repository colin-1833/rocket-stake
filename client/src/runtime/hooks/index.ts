import { useState, useEffect } from 'react';
import * as constants from '../constants/index';
import query_string from 'query-string';
import config from '../../config';
import {
    networks as deployment_networks
} from '../../deployments/index';
import type {
    TaskAction,
    Queries,
    Task,
    Runtime,
    Account,
    Staker,
    Toast,
    Settings,
    Validators,
    RethCollateral
} from '../interfaces';
import { ethers, BigNumber } from 'ethers';
import { notify } from 'react-notify-toast';
import _use_ethereum from './use-ethereum';

declare global {
    interface Window { ethereum: any; }
};

export const use_ethereum = _use_ethereum;

export const toast = {
    success: (text: string, duration?: number) => notify.show(text, 'custom', duration || 5000, { background: constants.colors.success_green, text: 'white' }),
    error: (text: string, duration?: number) => notify.show(text, 'custom', duration || 5000, { background: constants.colors.error_red, text: 'white' })
};

export const use_task = (runtime: Pick<Runtime, 'queries' | 'ethereum'>): Task => {
    const [task_action, setTask] = useState<TaskAction>('');
    const [task_args, setTaskArgs] = useState<Array<any>>([]);
    const [task_loading, setTaskLoading] = useState<boolean>(false);
    return {
        action: task_action,
        set: (task: TaskAction, args: Array<any>) => {
            if (task === '') {
                setTask(task);
                setTaskArgs(args);
                return;
            }
            if (!runtime.ethereum.connected) {
                return toast.error('You must connect metamask first');
            }
            if (!runtime.ethereum.connected_network.correct_subdomain) {
                return toast.error('Please change network to: ' + runtime.ethereum.connected_network.expects);
            }
            setTask(task);
            setTaskArgs(args);
        },
        loading: task_loading,
        set_loading: setTaskLoading,
        args: task_args
    };
}

export const use_queries = (): Queries => {
    const [params, setParams] = useState<any>(query_string.parse(window.location.search));
    useEffect(() => {
        setParams(query_string.parse(window.location.search));
    }, []);
    return {
        clear: () => {
            window.history.pushState(null, '', window.location.origin + window.location.pathname);
            setParams({});
        },
        remove: (key: string) => {
            if (typeof params[key] === 'undefined') {
                return;
            }
            const reconstructed_params = Object.entries(query_string.parse(window.location.search))
                .filter(([param_key]) => param_key !== key)
                .reduce((accum: any, [param_key, val]) => {
                    accum[param_key] = val;
                    return accum;
                }, {});
            const new_search = query_string.stringify(reconstructed_params);
            window.history.pushState(
                null,
                '',
                window.location.origin
                + window.location.pathname
                + (new_search ? ('?' + new_search) : '')
            );
            setParams(query_string.parse((new_search ? ('?' + new_search) : '')));
        },
        add: (key: string, val: any) => {
            const reconstructed_params = Object.entries(query_string.parse(window.location.search))
                .filter(([param_key]) => param_key !== key)
                .concat([[key, val]])
                .reduce((accum: any, [_param_key, _val]) => {
                    accum[_param_key] = _val;
                    return accum;
                }, {});

            const new_search = query_string.stringify(reconstructed_params);
            window.history.pushState(
                null,
                '',
                window.location.origin
                + window.location.pathname
                + (new_search ? ('?' + new_search) : '')
            );
            setParams(query_string.parse((new_search ? ('?' + new_search) : '')));
        },
        params
    }
};

export const use_toast = (runtime: Pick<Runtime, 'queries' | 'account' | 'constants'>): Toast => {
    const {
        account,
        queries
    } = runtime;
    useEffect(() => {
        if (account.loading) {
            return
        }
        const success_message_param = 'success_message';
        if (
            typeof queries.params[success_message_param] === 'string'
            && queries.params[success_message_param].length > 0
        ) {
            setTimeout(() => {
                toast.success(queries.params[success_message_param], 7000);
            }, 300);
        }
        queries.remove(success_message_param);
    }, [account.loading])
    return toast;
}

export const use_settings = (): Settings => {
    const [show_menu, set_menu] = useState(false);
    return {
        show: show_menu,
        set: set_menu
    }
};

export const use_validators = (runtime: Pick<Runtime, 'queries' | 'account' | 'reth_collateral'>): Validators => {
    const { account, reth_collateral } = runtime;
    return {
        is_valid_address: (address: string) => ethers.utils.isAddress(address),
        is_valid_withdrawal_delay: (num: number) => num < 2628000,
        is_valid_increase_stake_total: (num: BigNumber) => num.gt(0)
            && num.lte(ethers.utils.parseEther(String(account.staker.account_eth))),
        is_valid_stake_to_withdraw: (num: BigNumber) => num.gt(0)
            && num.lte(ethers.utils.parseEther(String(account.staker.staked_eth)))
            && num.lte(ethers.utils.parseEther(String(reth_collateral.total))),
        is_valid_deposit_reward: (num: BigNumber) => num.gt(0)
            && num.lte(ethers.utils.parseEther(String(account.staker.account_eth)))
    }
};

export const use_hardhat = (runtime: Pick<Runtime, 'queries' | 'ethereum'>) => {
    const { ethereum } = runtime;
    if (String(ethereum.connected_chain_id) === 'null') {
        return null;
    }
    if (ethereum.connected_network.name === 'goerli') {
        return deployment_networks[ethereum.connected_network.name];
    }
    return null;
};

export const use_reth_collateral = (runtime: Pick<Runtime, 'queries' | 'ethereum' | 'hardhat'>): RethCollateral => {
    const {
        ethereum,
        hardhat
    } = runtime;
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const load = (): Promise<void> => new Promise(async (resolve, reject) => {
        try {
            if (String(hardhat) === 'null' || Object.keys(hardhat).length === 0) {
                return resolve();
            }
            if (!ethereum.connected) {
                return resolve();
            }
            if (ethereum.connection_loading) {
                return resolve();
            }
            if (!ethereum.connected_network.correct_subdomain) {
                return resolve();
            }
            const { contracts: { RocketStake } } = hardhat;
            const rocket_stake = new ethers.Contract(RocketStake.address, RocketStake.abi, ethereum.signer);
            const reth_collateral_available = await rocket_stake.rocketPoolRETHCollateral();
            setTotal(Number((Number(ethers.utils.formatUnits(reth_collateral_available, 18))).toFixed(7)));
            resolve();
        } catch (err) { reject(err) }
    });
    const reload = async () => {
        setLoading(true);
        await load();
        setLoading(false);
    };
    useEffect(() => {
        if (ethereum.connected_address === '') {
            return;
        }
        setLoading(true);
        reload();
    }, [hardhat, ethereum.connected_network.expects, ethereum.connected_address, ethereum.connection_loading]);
    return {
        total,
        loading,
        reload
    };
};

export const use_account = (runtime: Pick<Runtime, 'queries' | 'task' | 'ethereum' | 'hardhat' | 'constants'>): Account => {
    const {
        ethereum,
        hardhat
    } = runtime;
    const [
        loading,
        setLoading
    ] = useState(true);
    const [total_reth, setTotalRETH] = useState(0);
    const [staker, setStaker] = useState<Staker>({
        blocks_until_withdrawals_allowed: 0,
        withdrawals_allowed: false,
        deposit_delay: 0,
        blocks_passed: 0,
        staked_eth: 0,
        account_eth: 0
    });
    const load_account_data = (): Promise<void> => new Promise(async (resolve, reject) => {
        try {
            if (String(hardhat) === 'null' || Object.keys(hardhat).length === 0) {
                return resolve();
            }
            if (!ethereum.connected) {
                return resolve();
            }
            if (ethereum.connection_loading) {
                return resolve();
            }
            if (!ethereum.connected_network.correct_subdomain) {
                return resolve();
            }
            const { contracts: { RocketStake } } = hardhat;
            const rocket_stake = new ethers.Contract(RocketStake.address, RocketStake.abi, ethereum.signer);
            const staked_eth = await rocket_stake.stakedETH(ethereum.connected_address);
            const [
                _last_deposit_block,
                _block_number,
                _deposit_delay
            ] = await rocket_stake.depositDelay(ethereum.connected_address);
            const total_reth_held = await rocket_stake.totalRETHHeld();
            const blocks_until_withdrawals_allowed = Math.max(
                0,
                _deposit_delay.toNumber() - (_block_number.toNumber() - _last_deposit_block.toNumber())
            );
            const withdrawals_allowed = blocks_until_withdrawals_allowed === 0;
            const account_eth = await ethereum.web3.getBalance(ethereum.connected_address);
            const display_staked_eth = Number((Number(ethers.utils.formatUnits(staked_eth, 18))).toFixed(7));
            setStaker({
                blocks_until_withdrawals_allowed,
                withdrawals_allowed,
                deposit_delay: _deposit_delay.toNumber(),
                blocks_passed: _block_number.toNumber() - _last_deposit_block.toNumber(),
                staked_eth: display_staked_eth,
                account_eth: Number(Number(ethers.utils.formatUnits(account_eth, 18)).toFixed(7))
            });
            setTotalRETH(Number(Number(ethers.utils.formatUnits(total_reth_held, 18)).toFixed(7)));
            resolve();
        } catch (err) { reject(err) }
    });
    const reload = async () => {
        setLoading(true);
        await load_account_data();
        setLoading(false);
    };
    useEffect(() => {
        if (ethereum.connected_address) {
            reload();
        }
    }, [
        hardhat,
        ethereum.connected_network.expects,
        ethereum.connected_address,
        ethereum.connection_loading
    ]);
    return {
        loading,
        reload,
        staker,
        total_reth
    }
};
