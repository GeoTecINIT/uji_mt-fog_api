const { default: Web3 } = require("web3");

module.exports = api => {
  const getBalance = async(address, req, res) => {
    try {
      const wei = await api.web3.eth.getBalance(address);
      api.makeResponse.success(res,
        req.query.unit ? api.web3.utils.fromWei(wei, req.query.unit) : wei);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  };

  api.get('/balance/get', (req, res) => getBalance(api.apiConfig.blockchainNetwork.config.address, req, res));
  api.get('/balance/get/:address', (req, res) => getBalance(req.params.address, req, res));
};
