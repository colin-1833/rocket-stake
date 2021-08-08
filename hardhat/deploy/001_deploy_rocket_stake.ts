import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, } from 'hardhat';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as utils from '../utils/index';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';

const path_to_env = path.resolve(__dirname, '../.env');

if (!fs.existsSync(path_to_env)) {
    fs.writeFileSync(path_to_env, '');
}

dotenv.config({ path: path_to_env });

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {
        deploy_live_testnet,
        deploy_mainnet
    } = utils.use_contracts(hre);
    if (hre.network.config.chainId === 1) {
        await deploy_mainnet({
            rocket_pool_storage_address: process.env.MAINNET_ROCKET_POOL_STORAGE_ADDRESS
        });
        return;
    }
    if (hre.network.config.chainId === 5) {
        await deploy_live_testnet({
            rocket_pool_storage_address: process.env.GOERLI_ROCKET_POOL_STORAGE_ADDRESS
        });
        return;
    }
    throw new Error('Unsupported testnet with chainId: ' + hre.network.config.chainId);
};
export default func;
func.tags = ['RocketStake'];
