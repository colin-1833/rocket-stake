import {
  NetworkName
} from '../interfaces';

export const colors = {
  etherscan: 'rgb(30, 45, 79)',
  background: '#222831',
  background_fade: 'rgba(48,71,94, .9)',
  pending: '#F5A962',
  button: '#F05454',
  card: '#DDDDDD',
  connected_address: '#80ed99',
  success_green: '#5AA469',
  error_red: '#F05454'
};

export const networks: { [key: string]: { color: string, name: NetworkName } } = {
  '1': {
    name: 'mainnet',
    color: 'rgb(42, 173, 165)'
  },
  '5': {
    name: 'goerli',
    color: 'rgb(43, 145, 236)'
  }
};

export const chain_ids: any = {
  '0x2a': 42,
  '0x5': 5,
  '0x4': 4,
  '0x3': 3,
  '0x1': 1
};