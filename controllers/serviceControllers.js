module.exports = api => {
  api.get('/service/get/:serviceName/at/:cellID', async(req, res) => {
    try {
      const cellID = api.utils.toFullCellID(req.params.cellID);
      const service = api.encoders.serviceName(req.params.serviceName);
      const devices = (await api.contracts.devices.methods.getDevicesInSameRegionWithService(cellID, service).call())
        .map(device => api.decoders.device(device));

      api.makeResponse.success(res, devices);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.get('/service/get/:serviceName/in/:regionID', async(req, res) => {
    try {
      const service = api.encoders.serviceName(req.params.serviceName);
      const devices = (await api.contracts.devices.methods.getDevicesInRegionWithService(req.params.regionID, service).call())
        .map(device => api.decoders.device(device));

      api.makeResponse.success(res, devices);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/service/data', (req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['service', 'data'])) {
        return;
      }

      // Record data for quality assessment

      console.log(`Device: ${req.get('Address')}, Service: ${req.body.service}, Data: ${JSON.stringify(req.body.data)}`);
      api.makeResponse.success(res);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/service/close', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['service', 'token'])) {
        return;
      }

      const address = req.get('Address');
      const quality = Math.random();

      console.log(`Random quality: ${quality}`);

      const device = api.decoders.device(await api.contracts.devices.methods.getDeviceFromAddress(address).call());

      api.feedbacks.push({
        device: address,
        regionID: device.regionID,
        service: req.body.service,
        token: req.body.token,
        quality: quality,
        consumerFeedback: null,
        sent: false
      });

      api.makeResponse.success(res);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/service/feedback', (req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['device', 'service', 'feedback', 'token'])) {
        return;
      }

      if (req.body.feedback < 0 || req.body.feedback > 1) {
        api.makeResponse.fail(res, 400, 'Invalid feedback value (should be between 0 to 1)');
        return;
      }

      let feedback = null;
      for (let i = 0; i < api.feedbacks.length; i++) {
        if (api.feedbacks[i].device === req.body.device
          && api.feedbacks[i].service === req.body.service
          && api.feedbacks[i].token === req.body.token) {
          feedback = api.feedbacks[i];
          break;
        }
      }

      if (!feedback) {
        api.makeResponse.fail(res, 404, 'Device service record not found');
        return;
      }

      if (feedback.sent) {
        api.makeResponse.fail(res, 422, 'Feedback has been already sent');
        return;
      }

      feedback.consumerFeedback = req.body.feedback;
      api.makeResponse.success(res);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });
};
