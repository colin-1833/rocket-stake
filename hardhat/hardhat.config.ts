import { task, HardhatUserConfig } from 'hardhat/config';
import { ethers } from 'ethers';
import * as path from 'path';
import * as fs from 'fs';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy'
import 'hardhat-contract-sizer';
import * as dotenv from 'dotenv';

const path_to_env = path.resolve(__dirname, './.env');

if (!fs.existsSync(path_to_env)) {
  fs.writeFileSync(path_to_env, '');
}

dotenv.config({ path: path_to_env });

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: ethers.Wallet.createRandom().mnemonic.phrase
      }
    },
    kovan: {
      chainId: 42,
      url: process.env.KOVAN_INFURA,
      accounts: [process.env.KOVAN_PRIVATE_KEY]
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_INFURA,
      accounts: [process.env.GOERLI_PRIVATE_KEY]
    },
    ropsten: {
      chainId: 3,
      url: process.env.ROPSTEN_INFURA,
      accounts: [process.env.ROPSTEN_PRIVATE_KEY]
    },
    rinkeby: {
      chainId: 4,
      url: process.env.RINKEBY_INFURA,
      accounts: [process.env.RINKEBY_PRIVATE_KEY]
    },
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_INFURA,
      accounts: [process.env.MAINNET_PRIVATE_KEY]
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.7.0'
      },
      {
        version: '0.8.0'
      }
    ]
  },
  paths: {
    
  },
  contractSizer: {
    alphaSort: false,
    runOnCompile: false,
    disambiguatePaths: false,
  }
};

export default config;
