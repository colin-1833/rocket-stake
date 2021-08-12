import type { Runtime } from '../runtime/interfaces';
import { ethers } from 'ethers';
import type { ContractTransaction, BigNumber } from 'ethers';

export const get_etherscan_base = (runtime: Runtime) => {
    const {
        ethereum
    } = runtime;
    if (ethereum.connected_network.expects.toLowerCase() === 'mainnet') {
        return 'https://etherscan.io';
    }
    return `https://${ethereum.connected_network.expects.toLowerCase()}.etherscan.io`;
};

const apply_lifecycles = (runtime: Runtime, func: () => Promise<void>): Promise<void> => new Promise(async (resolve, reject) => {
    try {
        const { task } = runtime;
        const current_task = task.action;
        const current_task_args = task.args.slice();
        task.set('loading', []);
        try {
            const data = await func();
            resolve(data);
        } catch (err) {
            console.log(err);
            task.set(current_task, current_task_args);
            resolve();
        }
    } catch (err) { reject(err) }
});

const main_contract_call = (runtime: Runtime, method: string, args: Array<any>, overrides?: any): Promise<string> => new Promise(async (resolve, reject) => {
    try {
        const {
            hardhat,
            account,
            ethereum,
            task,
            queries,
            toast
        } = runtime;
        if (String(hardhat) === 'null' || Object.keys(hardhat).length === 0) {
            return resolve('');
        }
        const { contracts: { RocketStake } } = hardhat;
        const rocket_stake = new ethers.Contract(RocketStake.address, RocketStake.abi, ethereum.signer)
        const expected_gas: BigNumber = await rocket_stake.estimateGas[method](...args, overrides || {});
        const gas_price = ethers.BigNumber.from(await ethereum.web3.getGasPrice());
        const gas_cost = Number(Number(ethers.utils.formatUnits(expected_gas.mul(gas_price), 18)).toFixed(7));
        console.log(`ESTIMATED GAS: ${gas_cost} ETH`);
        const tx: ContractTransaction = await rocket_stake[method](...args, overrides || {});
        queries.remove('pending_tx');
        queries.remove('pending_tx_method');
        queries.remove('pending_tx_success_message');
        queries.remove('success_message');
        ethereum.add_pending_transaction({ tx, method });
        task.set('', []);
        try {
            const confirmed_tx = await tx.wait(3);
            await account.reload();
            resolve(confirmed_tx.transactionHash);
        } catch (err: any) {
            reject(err);
            toast.error(err.message ? err.message : 'Contract call failed.')
        } finally {
            queries.remove('pending_tx');
            queries.remove('pending_tx_method');
            queries.remove('pending_tx_success_message');
            queries.remove('success_message');
            ethereum.remove_pending_transaction(tx.hash);
        }
    } catch (err) { reject(err) }
});

export const withdraw_stake = async (params: {
    stake_to_withdraw: number,
    runtime: Runtime
}) => {
    const {
        runtime,
        stake_to_withdraw
    } = params;
    const eth_as_big_number = ethers.utils.parseEther(String(stake_to_withdraw));
    await apply_lifecycles(
        runtime,
        () => new Promise(async (resolve, reject) => {
            try {
                if (!runtime.validators.is_valid_stake_to_withdraw(eth_as_big_number)) {
                    runtime.toast.error('Invalid amount of ETH to withdraw.')
                    return reject();
                }
                const success_message = `You successfully withdrew your ${stake_to_withdraw} ETH stake!`;
                runtime.queries.add('pending_tx_success_message', success_message);
                await main_contract_call(runtime, 'withdraw', [eth_as_big_number]);
                runtime.toast.success(success_message);
                resolve();
            } catch (err) { reject(err) }
        })
    )
};

export const increase_stake = async (params: {
    increase_stake_total: number,
    runtime: Runtime
}) => {
    const {
        runtime,
        increase_stake_total
    } = params;
    await apply_lifecycles(
        runtime,
        () => new Promise(async (resolve, reject) => {
            try {
                const eth_as_big_number = ethers.utils.parseEther(String(increase_stake_total));
                if (!runtime.validators.is_valid_increase_stake_total(eth_as_big_number)) {
                    runtime.toast.error('Invalid stake increase.')
                    return reject();
                }
                const success_message = `You successfully increased your stake by ${increase_stake_total} ETH!`;
                runtime.queries.add('pending_tx_success_message', success_message);
                await main_contract_call(runtime, 'stake', [], { value: eth_as_big_number });
                runtime.toast.success(success_message);
                resolve();
            } catch (err) { reject(err) }
        })
    )
};

