import * as hre from 'hardhat';
import { use, expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import * as utils from '../utils/index'

use(solidity);

describe('RocketStake - Staking rETH Collateral Limits', function () {
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
    it('should stake 5 ETH from the deployer and 2 of our available signers', async function () {
      await store.primary_contracts.RocketStake(store.deployer).stake({
        value: utils.parse_eth(50)
      });
      await store.primary_contracts.RocketStake(store.users[0]).stake({
        value: utils.parse_eth(50)
      });
      await store.primary_contracts.RocketStake(store.users[1]).stake({
        value: utils.parse_eth(100)
      });
      const ether_staked = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(ether_staked).to.equal(50);
    });
    it('should distribute 10 ETH in rewards', async function () {
      await store.primary_contracts.RocketStake(store.deployer).distributeRewards({
        value: utils.parse_eth(100)
      });
      const staked_eth = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(staked_eth).to.equal(75);
    });
  });

  describe('rETH collateral behavior', function () {
    it(`should lower the rETH collateral`, async function () {
      await store.stub_contracts.RocketTokenRETH(store.deployer).updateTotalCollateral(utils.parse_eth(1));
      expect(
        utils.format_eth(
          await store.stub_contracts.RocketTokenRETH(store.deployer).getTotalCollateral()
        )
      ).to.equal(1);
    });
    it(`should fail to withdraw due to limited collateral`, async function () {
      try {
        await store.primary_contracts.RocketStake(store.deployer).withdraw(utils.parse_eth(10));
        throw new Error('The collateral limit did nothing!');
      } catch(err) {}
    });
  });
});