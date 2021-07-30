import * as hre from 'hardhat';
import { use, expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import * as utils from '../utils/index'

const { ethers } = hre;

use(solidity);

describe('RocketStake - Guardian', function () {
  const {
    deploy_stubbed_testnet,
    store
  } = utils.use_contracts(hre);
  describe('deploy stubbed network', function () {
    it('should instantiate network', async function () {
      await deploy_stubbed_testnet();
    });
  });

  describe('update rp storage key manager', function () {
    it('should change rp storage key manager', async function () {
      const [first_user] = store.users;
      await store.primary_contracts.RocketStake(store.deployer).updateRocketPoolStorageKeyManager(await first_user.getAddress())
      expect(
        await store.primary_contracts.RocketStake(store.deployer).getRocketPoolStorageKeyManager()
      ).to.equal(await first_user.getAddress());
    });
    it('should fail to update rp storage key manager', async function () {
      const [first_user] = store.users;
      try {
        await store.primary_contracts.RocketStake(store.deployer).updateRocketPoolStorageKeyManager(await first_user.getAddress());
        throw new Error('you should not be able to update rp storage key manager as a non-rp storage key manager yourself.');
      } catch(err) {}
    });
    it('should change rp storage key manager back to the original deployer', async function () {
      const [first_user] = store.users;
      await store.primary_contracts.RocketStake(first_user).updateRocketPoolStorageKeyManager(await store.deployer.getAddress());
      expect(
        await store.primary_contracts.RocketStake(store.deployer).getRocketPoolStorageKeyManager()
      ).to.equal(await store.deployer.getAddress());
    });
  });

  describe('update params restricted to rp storage key manager', function () {
    it('should update rocket params', async function () {
      const [first_user] = store.users;
      const original_rocket_deposit_pool_storage_key = await store.primary_contracts.RocketStake(store.deployer).rocketDepositPoolStorageKey();
      const original_rocket_reth_token_storage_key = await store.primary_contracts.RocketStake(store.deployer).rocketRethTokenStorageKey();
      try {
        await store.primary_contracts.RocketStake(first_user).updateRocketDepositPoolStorageKey(
          ethers.utils.solidityKeccak256(
            ['string', 'string'], ['contract.address', 'asdf']
          )
        );
        throw new Error(`the following user: ${first_user} should not be able to do that.`)
      } catch(err) {}
      try {
        await store.primary_contracts.RocketStake(first_user).updateRocketRethTokenStorageKey(
          ethers.utils.solidityKeccak256(
            ['string', 'string'], ['contract.address', 'wetsdfga']
          )
        );
        throw new Error(`the following user: ${first_user} should not be able to do that.`)
      } catch(err) {}
      await store.primary_contracts.RocketStake(store.deployer).updateRocketDepositPoolStorageKey(
        ethers.utils.solidityKeccak256(
          ['string', 'string'], ['contract.address', 'asdf']
        )
      );
      await store.primary_contracts.RocketStake(store.deployer).updateRocketRethTokenStorageKey(
        ethers.utils.solidityKeccak256(
          ['string', 'string'], ['contract.address', 'wetsdfga']
        )
      );
      const new_rocket_deposit_pool_storage_key = await store.primary_contracts.RocketStake(store.deployer).rocketDepositPoolStorageKey();
      const new_rocket_reth_token_storage_key = await store.primary_contracts.RocketStake(store.deployer).rocketRethTokenStorageKey();
      expect(new_rocket_deposit_pool_storage_key).to.equal(
        ethers.utils.solidityKeccak256(
          ['string', 'string'], ['contract.address', 'asdf']
        )
      );
      expect(new_rocket_reth_token_storage_key).to.equal(
        ethers.utils.solidityKeccak256(
          ['string', 'string'], ['contract.address', 'wetsdfga']
        )
      );
      await store.primary_contracts.RocketStake(store.deployer).updateRocketDepositPoolStorageKey(original_rocket_deposit_pool_storage_key);
      await store.primary_contracts.RocketStake(store.deployer).updateRocketRethTokenStorageKey(original_rocket_reth_token_storage_key);
    });
    it('should fail to update rp storage key manager', async function () {
      const [first_user] = store.users;
      try {
        await store.primary_contracts.RocketStake(store.deployer).updateRocketPoolStorageKeyManager(await first_user.getAddress());
        throw new Error('you should not be able to update rp storage key manager as a non-rp storage key manager yourself.');
      } catch(err) {}
    });
    it('should change rp storage key manager back to the original deployer', async function () {
      const [first_user] = store.users;
      await store.primary_contracts.RocketStake(first_user).updateRocketPoolStorageKeyManager(await store.deployer.getAddress());
      expect(
        await store.primary_contracts.RocketStake(store.deployer).getRocketPoolStorageKeyManager()
      ).to.equal(await store.deployer.getAddress());
    });
  });
});
