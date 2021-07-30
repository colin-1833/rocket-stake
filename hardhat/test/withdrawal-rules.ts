import * as hre from 'hardhat';
import { use, expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import * as utils from '../utils/index'

use(solidity);

const wait_seconds = (seconds: number): Promise<void> => new Promise((resolve) => setTimeout(() => resolve(), seconds * 1000));

describe('RocketStake - Withdrawal Rules', function () {
  const {
    deploy_stubbed_testnet,
    store
  } = utils.use_contracts(hre);

  describe('deploy stubbed network', function () {
    it('should instantiate network', async function () {
      await deploy_stubbed_testnet();
    });
  });

  describe('setup an initial stake', function () {
    it('should stake 5 ETH from the deployer and 1 of our available signers', async function () {
      await store.primary_contracts.RocketStake(store.deployer).stake({
        value: utils.parse_eth(5)
      });
      await store.primary_contracts.RocketStake(store.users[0]).stake({
        value: utils.parse_eth(5)
      });
      const deployer_ether_staked = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(deployer_ether_staked).to.equal(5);
      const first_user_ether_staked = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(first_user_ether_staked).to.equal(5);
    });

    it('should distribute 15 ETH in rewards', async function () {
      await store.primary_contracts.RocketStake(store.deployer).distributeRewards({
        value: utils.parse_eth(15)
      });
      const staked_eth = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(staked_eth).to.equal(12.5);
    });
  });

  describe('claim and withdraw eth', function () {
    it('withdraw eth stake', async function () {
      const _pre_withdrawal_staked_eth = await store.primary_contracts.RocketStake(store.deployer).accountStakedETH(await store.deployer.getAddress())
      await store.primary_contracts.RocketStake(store.deployer)
          .withdraw(utils.parse_eth(12.5));
      const _staked_eth = await store.primary_contracts.RocketStake(store.deployer).accountStakedETH(await store.deployer.getAddress())
      const pre_withdrawal_eth = utils.format_eth(_pre_withdrawal_staked_eth);
      const staked_eth = utils.format_eth(_staked_eth);
      expect(pre_withdrawal_eth).to.equal(12.5);
      expect(staked_eth).to.equal(0);
    });
  });
  
  describe('add back withdrawn and claimed stake', function () {
    it('should stake 5 ETH from the deployer', async function () {
      await store.primary_contracts.RocketStake(store.deployer).stake({
        value: utils.parse_eth(5)
      });
      const deployer_ether_staked = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(deployer_ether_staked).to.equal(5);
    });
  });
});
