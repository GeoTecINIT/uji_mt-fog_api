module.exports = api => {
  api.get('/reputation/get/:deviceAddr', async(req, res) => {
    try {
      const reputation = await api.contracts.reputationManagement.methods.getReputation(req.params.deviceAddr).call();

      api.makeResponse.success(res, {reputation: reputation});
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/reputation/get/:deviceAddr/in/:regionID', async(req, res) => {
    try {
      const reputation = await api.contracts.reputationManagement.methods.getReputation(req.params.deviceAddr, req.params.regionID).call();

      api.makeResponse.success(res, {reputation: reputation});
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/reputation/submit', async(req, res) => {
    try {
      if (!api.unlockAccount(res, req)) {
        return;
      }

      const hashes = [];

      const fromAddr = req.get('Address') ? req.get('Address') : api.apiConfig.blockchainNetwork.config.address;

      const promises = api.feedbacks.filter(f => !f.sent).map(feedback => new Promise((resolve, reject) => {
        try {
          const value = feedback.consumerFeedback === null ?
            Math.round(feedback.quality * 65536) : Math.round((feedback.quality + feedback.consumerFeedback) / 2 * 65536);
          api.contracts.reputationManagement.methods.addFeedback(feedback.device, value).send({from: fromAddr})
            .on('transactionHash', hash => {
              feedback.sent = true;
              hashes.push(hash);
              resolve();
            });
        } catch (err) {
          reject(err);
        }
      }));

      await Promise.all(promises);

      api.makeResponse.success(res, hashes);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });
};
