import goerli from './goerli.json';
import mainnet from './mainnet.json';

export const networks = {
  goerli,
  mainnet
};

export const deployed = Object.entries(networks)
  .filter(([,config]) => Object.keys(config).length > 0)
  .map(([network]) => network.toLowerCase());