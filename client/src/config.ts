import * as deployments from './deployments/index';

const ROPSTEN_rETH_ADDRESS = deployments.networks.ropsten.contracts.RocketTokenRETH.address;
const GOERLI_rETH_ADDRESS = '0x178e141a0e3b34152f73ff610437a7bf9b83267a';
const MAINNET_rETH_ADDRESS = '';
const GOERLI_ROCKET_STAKE_ADDRESS = deployments.networks.goerli.contracts.RocketStake.address;
const ROPSTEN_ROCKET_STAKE_ADDRESS = deployments.networks.ropsten.contracts.RocketStake.address;
const MAINNET_ROCKET_STAKE_ADDRESS = '';

const config = {
    "github_url": "https://github.com/colin-1833/rocket-stake",
    "rETH_address": {
        "goerli": GOERLI_rETH_ADDRESS,
        "ropsten": ROPSTEN_rETH_ADDRESS,
        "mainnet": MAINNET_rETH_ADDRESS
    },
    "rocket_stake_address": {
        "ropsten": ROPSTEN_ROCKET_STAKE_ADDRESS,
        "goerli": GOERLI_ROCKET_STAKE_ADDRESS,
        "mainnet": MAINNET_ROCKET_STAKE_ADDRESS
    }
};;

export default config;