module.exports = api => {
  api.get('/network/genesis', (req, res) => {
    if (api.apiConfig.blockchainNetwork && api.apiConfig.blockchainNetwork.genesis) {
      api.makeResponse.success(res, api.apiConfig.blockchainNetwork.genesis);
    } else {
      api.makeResponse.fail(500, 'There is no genesis information configured in this server');
    }
  });
};
