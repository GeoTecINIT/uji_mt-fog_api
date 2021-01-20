const createWeb3Instance = require('./utils/web3');
const Common = require('ethereumjs-common');

module.exports = async(api) => {
  api.web3 = createWeb3Instance(api.apiConfig.blockchainNetwork.config);
  
  api.chainID = api.apiConfig.blockchainNetwork.genesis.config.chainId;
  api.networkID = api.apiConfig.blockchainNetwork.config.network_id;
  const common = {
    name: 'custom-network',
    networkId: `0x${(api.networkID).toString(16)}`,
    chainId: `0x${(api.chainID).toString(16)}`
  };
  api.common = Common.default.forCustomChain('mainnet', common, 'petersburg');
};
