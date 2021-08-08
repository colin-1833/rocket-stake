import goerli from './goerli.json';
import prater from './prater.json';
import kovan from './kovan.json';
import ropsten from './ropsten.json';
import rinkeby from './rinkeby.json';
import mainnet from './mainnet.json';
import local from './local.json';

export const networks = {
    prater,
    goerli,
    kovan,
    ropsten,
    mainnet,
    rinkeby,
    local
};

export const deployed = Object.entries(networks)
    .filter(([, config]) => Object.keys(config).length > 0)
    .map(([network]) => network.toLowerCase());