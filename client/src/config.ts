import * as deployments from './deployments/index';

const RINKEBY_rETH_ADDRESS = deployments.networks.rinkeby.contracts.RocketTokenRETH.address;
const ROPSTEN_rETH_ADDRESS = deployments.networks.ropsten.contracts.RocketTokenRETH.address;
const GOERLI_rETH_ADDRESS = '';
const MAINNET_rETH_ADDRESS = '';
const KOVAN_rETH_ADDRESS = deployments.networks.kovan.contracts.RocketTokenRETH.address;
const LOCAL_rETH_ADDRESS = deployments.networks.local.contracts.RocketTokenRETH.address;

const RINKEBY_ROCKET_STAKE_ADDRESS = deployments.networks.rinkeby.contracts.RocketStake.address;
const ROPSTEN_ROCKET_STAKE_ADDRESS = deployments.networks.ropsten.contracts.RocketStake.address;
const GOERLI_ROCKET_STAKE_ADDRESS = '';
const MAINNET_ROCKET_STAKE_ADDRESS = '';
const KOVAN_ROCKET_STAKE_ADDRESS = deployments.networks.kovan.contracts.RocketStake.address;
const LOCAL_ROCKET_STAKE_ADDRESS = deployments.networks.local.contracts.RocketStake.address;

const config = {
  "github_url": "https://github.com/colin-1833/rocket-stake",
  "enable_reward_deposits": true,
  "turn_on_address_confirmations": false,
  "rETH_address": {
    "rinkeby": RINKEBY_rETH_ADDRESS,
    "ropsten": ROPSTEN_rETH_ADDRESS,
    "goerli": GOERLI_rETH_ADDRESS,
    "kovan": KOVAN_rETH_ADDRESS,
    "local": LOCAL_rETH_ADDRESS,
    "mainnet": MAINNET_rETH_ADDRESS
  },
  "rocket_stake_address": {
    "rinkeby": RINKEBY_ROCKET_STAKE_ADDRESS,
    "ropsten": ROPSTEN_ROCKET_STAKE_ADDRESS,
    "goerli": GOERLI_ROCKET_STAKE_ADDRESS,
    "kovan": KOVAN_ROCKET_STAKE_ADDRESS,
    "local": LOCAL_ROCKET_STAKE_ADDRESS,
    "mainnet": MAINNET_ROCKET_STAKE_ADDRESS
  }
};;

export default config;