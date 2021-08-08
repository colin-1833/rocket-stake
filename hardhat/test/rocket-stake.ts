import * as hre from 'hardhat';
import { use, expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import * as utils from '../utils/index'

use(solidity);

const next_block = (): Promise<void> => new Promise(async (resolve, reject) => {
    try {
        await hre.ethers.provider.send("evm_increaseTime", [13]);
        await hre.ethers.provider.send("evm_mine", []);
        resolve();
    } catch (err) { reject(err) }
});

describe('RocketStake', function () {
    const {
        store,
        deploy_stubbed_testnet
    } = utils.use_contracts(hre);

    describe('deploy stubbed network', function () {
        it('should instantiate network', async function () {
            await deploy_stubbed_testnet();
        });
    });

    describe('attempt multiple stake and withdrawals from different accounts', function () {
        it('should stake 10 ETH with account 1', async function () {
            await (await store.primary_contracts.RocketStake(store.deployer)
                .stake({ value: utils.parse_eth(10) })).wait(1);
            expect(
                utils.format_eth(
                    await store.primary_contracts.RocketStake(store.deployer)
                        .stakedETH(await store.deployer.getAddress())
                )
            ).to.equal(10);
        });

        it('should stake and fail/succeed to withdraw', async function () {
            await (await store.primary_contracts.RocketStake(store.deployer)
                .stake({ value: utils.parse_eth(10) })).wait(1);

            try {
                await (await store.primary_contracts.RocketStake(store.deployer)
                    .withdraw(utils.parse_eth(10))).wait(1);
                throw new Error('Should fail to withdraw before the deposit delay has passed.')
            } catch (err) { };

            await (await store.primary_contracts.RocketStake(store.deployer)
                .stake({ value: utils.parse_eth(10) })).wait(1);

            // simulate 7 blocks passing first
            await next_block();
            await next_block();
            await next_block();
            await next_block();
            await next_block();
            await next_block();
            await next_block();

            await (await store.primary_contracts.RocketStake(store.deployer)
                .withdraw(utils.parse_eth(10))).wait(1);

            expect(
                utils.format_eth(
                    await store.primary_contracts.RocketStake(store.deployer)
                        .stakedETH(await store.deployer.getAddress())
                )
            ).to.equal(20);
        });

        it('should ensure registration works', async function () {
            await (await store.primary_contracts.RocketStake(store.deployer)
                .register()).wait(1);
            await (await store.primary_contracts.RocketStake(store.users[0])
                .register()).wait(1);
            const existing_buyer_address = await store.primary_contracts.RocketStake(store.deployer)
                .buyerAddress(await store.users[0].getAddress());
            const non_existing_buyer_address = await store.primary_contracts.RocketStake(store.deployer)
                .buyerAddress(await store.users[1].getAddress());
            expect(existing_buyer_address).to.not.equal('0x0000000000000000000000000000000000000000');
            expect(non_existing_buyer_address).to.equal('0x0000000000000000000000000000000000000000');
        });

        it('should ensure withdrawals fail under various conditions', async function () {
            try {
                await (await store.primary_contracts.RocketStake(store.deployer)
                    .withdraw(0)).wait(1);;
                throw new Error('expected to fail due to needing to supply a non-zero amount of ETH');
            } catch (err) { }
            try {
                await (await store.primary_contracts.RocketStake(store.users[1])
                    .withdraw(10)).wait(1);;
                throw new Error('expected to fail due to staker not existing yet.')
            } catch (err) { }
            try {
                await (await store.primary_contracts.RocketStake(store.deployer)
                    .withdraw(utils.parse_eth(90))).wait(1);
                throw new Error('Expected to fail due to trying to withdraw too much ETH.');
            } catch (err) { }
        });
    });
});
