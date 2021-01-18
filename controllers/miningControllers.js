module.exports = api => {
  api.get('/mining/status', async(req, res) => {
    try {
      const isMining = await api.web3.eth.isMining();
      api.makeResponse.success(res, isMining);
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });
};
