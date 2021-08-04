import { DeployOptions } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { ethers } from 'hardhat'; 
import type { Signer, Contract, BigNumber } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';

const get_file_paths = (dir_path: string, file_paths: Array<string> = []): Array<string> => {
  let files = fs.readdirSync(dir_path)
  file_paths = file_paths || []
  files.forEach(function(file) {
    if (fs.statSync(dir_path + "/" + file).isDirectory()) {
      file_paths = get_file_paths(dir_path + "/" + file, file_paths)
    } else {
      file_paths.push(path.join(__dirname, dir_path, "/", file))
    }
  })
  return file_paths
};

const contract_names = get_file_paths(path.resolve(__dirname, '..', 'contracts'))
  .filter(path => path.endsWith('.sol'))
  .map(path => path.split('/').reverse()[0].split('.sol').filter(e => e)[0]);

export const format_eth = (eth: BigNumber) => Number((Number(ethers.utils.formatUnits(eth))).toFixed(10));

export const parse_eth = (num: number) => ethers.utils.parseEther(String(num))

type UseContract = (signer: Signer) => Contract;

export const deploy = (
  hre: HardhatRuntimeEnvironment,
  contract_name: string,
  deploy_options: DeployOptions
): Promise<UseContract> => new Promise(async (resolve, reject) => { try {
  if (!contract_names.includes(contract_name)) {
    throw new Error(`${contract_name}.sol does not exist in the contracts/ folder`);
  }
  const { deployments } = hre;
  const { deploy: _deploy } = deployments;
  const { address } = await _deploy(contract_name, deploy_options);
  console.log(`  - deployed ${contract_name} at: ${address}`);
  const Contract = (await ethers.getContractFactory(contract_name)).attach(address);
  resolve((signer: Signer) => Contract.connect(signer));
} catch (err) { reject(err) }});

interface PrimaryContracts {
  RocketStake: UseContract|null
};

interface UseContractsStore {
  primary_contracts: PrimaryContracts, 
  deployer: Signer,
  users: Array<Signer>
};

export const use_contracts = (hre: HardhatRuntimeEnvironment): { 
  deploy_live_testnet: (opts: { 
    rocket_pool_storage_address: string
  }) => Promise<any>, 
  deploy_mainnet: (opts: { 
    rocket_pool_storage_address: string
  }) => Promise<any>, 
  store: UseContractsStore
} => {
  let store: UseContractsStore = {
    primary_contracts: {
      RocketStake: null
    },
    deployer: null,
    users: []
  };
  return {
    deploy_live_testnet: ({
      rocket_pool_storage_address
    }): Promise<void> => new Promise(async (resolve, reject) => { try {
      const unnamed_signers = await hre.ethers.getUnnamedSigners();
      store.deployer = unnamed_signers[0]
      store.users = unnamed_signers.slice(1);
      store.primary_contracts.RocketStake = await deploy(
        hre,
        'RocketStake',
        { 
          from: await store.deployer.getAddress(), 
          args: [
            rocket_pool_storage_address
          ]
        }
      );
      resolve();
    } catch (err) { reject(err) }}),
    deploy_mainnet: ({
      rocket_pool_storage_address
    }): Promise<void> => new Promise(async (resolve, reject) => { try {
      const unnamed_signers = await hre.ethers.getUnnamedSigners();
      store.deployer = unnamed_signers[0]
      store.users = unnamed_signers.slice(1);
      store.primary_contracts.RocketStake = await deploy(
        hre,
        'RocketStake',
        { 
          from: await store.deployer.getAddress(), 
          args: [
            rocket_pool_storage_address,
            false
          ] 
        }
      );
      resolve();
    } catch (err) { reject(err) }}),
    store
  };
};