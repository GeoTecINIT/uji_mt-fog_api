const Web3 = require('web3');
const Common = require('ethereumjs-common');

module.exports = async(api) => {
  api.web3 = new Web3(
    `http://${api.apiConfig.blockchainNetwork.config.host}:${api.apiConfig.blockchainNetwork.config.port}`
  );
  
  api.chainID = api.apiConfig.blockchainNetwork.genesis.config.chainId;
  api.networkID = api.apiConfig.blockchainNetwork.config.network_id;
  const common = {
    name: 'custom-network',
    networkId: `0x${(api.networkID).toString(16)}`,
    chainId: `0x${(api.chainID).toString(16)}`
  };
  api.common = Common.default.forCustomChain('mainnet', common, 'petersburg');
};
