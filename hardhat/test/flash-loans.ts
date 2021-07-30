import * as hre from 'hardhat';
import { use, expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import * as utils from '../utils/index'

use(solidity);

const wait_seconds = (seconds: number): Promise<void> => new Promise((resolve) => setTimeout(() => resolve(), seconds * 1000));

describe('RocketStake - Flash Loans', function () {
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
    it('should stake 500 ETH from the deployer and 1 of our available signers', async function () {
      await store.primary_contracts.RocketStake(store.deployer).stake({
        value: utils.parse_eth(500)
      });
      await store.primary_contracts.RocketStake(store.users[0]).stake({
        value: utils.parse_eth(500)
      });
      const deployer_ether_staked = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(deployer_ether_staked).to.equal(500);
      const first_user_ether_staked = utils.format_eth(
        await store.primary_contracts.RocketStake(store.deployer)
          .accountStakedETH(await store.deployer.getAddress())
      );
      expect(first_user_ether_staked).to.equal(500);
    });

    it('should change flash loan settings and permissions', async function () {
      await store.primary_contracts.RocketStake(store.deployer).updateFlashLoanFeeManager(await store.users[0].getAddress());
      const new_loan_manager = await store.primary_contracts.RocketStake(store.deployer).flashLoanManager();
      expect(new_loan_manager).to.equal(await store.users[0].getAddress());
      try {
        await store.primary_contracts.RocketStake(store.deployer).updateFlashLoanFeeManager(await store.users[0].getAddress());
        throw new Error('The original fee manager should not be able to do that.')
      } catch(err) {};
      try {
        await store.primary_contracts.RocketStake(store.deployer).updateFlashLoanDevCut(1);
        throw new Error('The original fee manager should not be able to do that.')
      } catch(err) {};
      try {
        await store.primary_contracts.RocketStake(store.deployer).updateFlashLoanFee(1);
        throw new Error('The original fee manager should not be able to do that.')
      } catch(err) {};
      await store.primary_contracts.RocketStake(store.users[0]).updateFlashLoanDevCut(1);
      await store.primary_contracts.RocketStake(store.users[0]).updateFlashLoanFee(1);
      expect(
        (await store.primary_contracts.RocketStake(store.deployer).flashLoanFee()).toNumber()
      ).to.equal(1);
      expect(
        (await store.primary_contracts.RocketStake(store.deployer).flashLoanDevCut()).toNumber()
      ).to.equal(1);
      await store.primary_contracts.RocketStake(store.users[0]).updateFlashLoanDevCut(500);
      await store.primary_contracts.RocketStake(store.users[0]).updateFlashLoanFee(10000);
    });
    
    it('should simulate a flash loan borrower', async function () {
      const rocket_stake_reth = await store.stub_contracts.RocketTokenRETH(store.deployer).balanceOf(
        store.primary_contracts.RocketStake(store.deployer).address
      );
      await store.stub_contracts.FlashLoanBorrower(store.deployer).fund({
        value: utils.parse_eth(500)
      });
      await store.stub_contracts.FlashLoanBorrower(store.deployer).flashBorrow(utils.parse_eth(500));
      const rocket_stake_reth_generated_from_load = (
        await store.stub_contracts.RocketTokenRETH(store.deployer).balanceOf(
          store.primary_contracts.RocketStake(store.deployer).address
        )
      ).sub(rocket_stake_reth);
      expect(utils.format_eth(rocket_stake_reth_generated_from_load)).to.equal(.5);
    });

    it('should confirm correct payout to dev and stakers', async function () {
      const flash_load_dev_fees = await store.primary_contracts.RocketStake(store.deployer).flashLoanDevFeesTotal();
      const flash_loan_staker_fees = await store.primary_contracts.RocketStake(store.deployer).flashLoanStakerFeesTotal();
      const staked_eth_before = await store.primary_contracts.RocketStake(store.users[0]).accountStakedETH(
        await store.users[0].getAddress()
      );
      await store.stub_contracts.FlashLoanBorrower(store.deployer).fund({
        value: utils.parse_eth(500)
      });
      await store.stub_contracts.FlashLoanBorrower(store.deployer).flashBorrow(utils.parse_eth(500));
      const staked_eth_after = await store.primary_contracts.RocketStake(store.users[0]).accountStakedETH(
        await store.users[0].getAddress()
      );
      expect(utils.format_eth(staked_eth_after.sub(staked_eth_before)).toFixed(3)).to.equal(0.125.toFixed(3))
      expect(utils.format_eth(flash_load_dev_fees)).to.equal(.25);
      expect(utils.format_eth(flash_loan_staker_fees)).to.equal(.25);
    });
  });
});
