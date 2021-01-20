module.exports = api => {
  api.get('/alive', (req, res) => {
    api.makeResponse.success(res, null);
  });
};
