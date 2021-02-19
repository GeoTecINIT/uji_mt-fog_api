module.exports = api => {
  api.get('/reputation/get/value/:deviceAddr/:serviceName', async(req, res) => {
    try {
      const service = api.encoders.serviceName(req.params.serviceName);
      const reputation = await api.contracts.reputationManagement.methods.getReputationValue(req.params.deviceAddr, service).call();

      api.makeResponse.success(res, {reputation: reputation / 0xffffffffffffffff});
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/reputation/get/value/:deviceAddr/:serviceName/in/:regionID', async(req, res) => {
    try {
      const service = api.encoders.serviceName(req.params.serviceName);
      const reputation = await api.contracts.reputationManagement.methods.getReputationValue(req.params.regionID, req.params.deviceAddr, service).call();

      api.makeResponse.success(res, {reputation: reputation / 0xffffffffffffffff});
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/reputation/get/records/:deviceAddr/:serviceName', async(req, res) => {
    try {
      const service = api.encoders.serviceName(req.params.serviceName);
      const reputationRecords = api.decoders.reputation(await api.contracts.reputationManagement.methods.getReputationData(req.params.deviceAddr, service).call());

      api.makeResponse.success(res, reputationRecords);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/reputation/get/records/:deviceAddr/:serviceName/in/:regionID', async(req, res) => {
    try {
      const service = api.encoders.serviceName(req.params.serviceName);
      const reputationRecords = api.decoders.reputation(await api.contracts.reputationManagement.methods.getReputationData(req.params.regionID, req.params.deviceAddr, service).call());

      api.makeResponse.success(res, reputationRecords);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/reputation/list/:serviceName/in/:regionID', async(req, res) => {
    try {
      const service = api.encoders.serviceName(req.params.serviceName);
      const deviceReputations = (await api.contracts.reputationManagement.methods.getInRegionWithService(req.params.regionID, service).call())
        .map(dR => api.decoders.deviceReputation(dR));
      
      api.makeResponse.success(res, deviceReputations);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/reputation/list/:serviceName/at/:cellID', async(req, res) => {
    try {
      const service = api.encoders.serviceName(req.params.serviceName);
      const cellID = api.utils.toFullCellID(req.params.cellID);

      const deviceReputations = (await api.contracts.reputationManagement.methods.getInSameRegionWithService(cellID, service).call())
        .map(dR => api.decoders.deviceReputation(dR));
      
      api.makeResponse.success(res, deviceReputations);
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
          let value = feedback.quality;
          if (feedback.consumerFeedback !== null) {
            value += feedback.consumerFeedback;
            value /= 2;
          }
          console.log(value);
          value *= 0xffffffffffffffff;
          value = Math.min(value, 0xffffffffffffffff);
          value = Math.max(value, 0);
          const service = api.encoders.serviceName(feedback.service);
          api.contracts.reputationManagement.methods.updateReputation(feedback.regionID, feedback.device, service, value.toString()).send({from: fromAddr})
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
