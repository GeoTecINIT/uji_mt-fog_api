const readConfig = require('../utils/config');

module.exports = api => {
  api.get('/network/default-config', (req, res) => {
    try {
      const config = readConfig();
      config.blockchainNetwork.config.host = '127.0.0.1';
      config.blockchainNetwork.config.port = 8545;
      config.blockchainNetwork.config.network_id = 2564;
      config.blockchainNetwork.config.address = '';
      config.host.networkInterface = '';
      api.makeResponse.success(res, config);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/network/genesis', (req, res) => {
    if (api.apiConfig.blockchainNetwork && api.apiConfig.blockchainNetwork.genesis) {
      api.makeResponse.success(res, api.apiConfig.blockchainNetwork.genesis);
    } else {
      api.makeResponse.fail(500, 'There is no genesis information configured in this server');
    }
  });
};
