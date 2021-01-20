const Web3 = require('web3');

module.exports = blockchainNetworkConfig => new Web3(`http://${blockchainNetworkConfig.host}:${blockchainNetworkConfig.port}`);
