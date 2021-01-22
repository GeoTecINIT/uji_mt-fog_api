module.exports = api => {
  const getDevice = async(address) => {
    const device = api.decoders.device(
      await api.contracts.devices.methods.getDeviceFromAddress(address).call()
    );
    return device;
  };

  api.get('/device/get/:address', async(req, res) => {
    try {
      if (!req.params.address) {
        api.makeResponse.fail(res, 400, 'Invalid address', err);
        return;
      }

      const device = await getDevice(req.params.address);

      if (!device.active) {
        api.makeResponse.fail(res, 404, 'Device not found or not active', null);
        return;
      }

      api.makeResponse.success(res, device);
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });

  api.post('/device/register/tx', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['location', 'ipv4', 'ipv6', 'services'])) {
        return;
      }

      const deviceInContract = await getDevice(req.get('Address'));
      if (deviceInContract.active) {
        api.makeResponse.fail(res, 422, 'Device is already active');
        return;
      }

      const method = api.contracts.devices.methods.registerDevice(
        api.utils.toFullCellID(req.body.location),
        api.encoders.ipv4(req.body.ipv4),
        api.encoders.ipv6(req.body.ipv6),
        req.body.services.map(s => api.encoders.serviceName(s))
      );

      api.sendUnsignedMethodTransaction(res, req, method, api.contracts.devices);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/device/update/location/tx', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['location'])) {
        return;
      }

      req.body.location = api.utils.toFullCellID(req.body.location);

      const deviceInContract = await getDevice(req.get('Address'));
      if (deviceInContract.location === req.body.location) {
        api.makeResponse.fail(res, 422, 'Device has not moved');
        return;
      }

      const method = api.contracts.devices.methods.updateDeviceLocation(req.body.location);
      api.sendUnsignedMethodTransaction(res, req, method, api.contracts.devices);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/device/update/services/tx', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['services'])) {
        return;
      }

      const deviceInContract = await getDevice(req.get('Address'));
      if (!deviceInContract.active) {
        api.makeResponse.fail(res, 422, 'Device is not active');
        return;
      }

      const method = api.contracts.devices.methods.updateDeviceServices(
        req.body.services.map(s => api.encoders.serviceName(s))
      );
      api.sendUnsignedMethodTransaction(res, req, method, api.contracts.devices);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/device/update/ip/tx', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['ipv4', 'ipv6'])) {
        return;
      }

      const deviceInContract = await getDevice(req.get('Address'));
      if (deviceInContract.ipv4 === req.body.ipv4 && deviceInContract.ipv6 === req.body.ipv6) {
        api.makeResponse.fail(res, 422, 'IP is not changed');
        return;
      }

      const method = api.contracts.devices.methods.updateDeviceIPs(
        api.encoders.ipv4(req.body.ipv4),
        api.encoders.ipv4(req.body.ipv6)
      );
      api.sendUnsignedMethodTransaction(res, req, method, api.contracts.devices);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.delete('/device/deactivate', async(req, res) => {
    try {

      const deviceInContract = await getDevice(req.get('Address'));
      if (!deviceInContract.active) {
        api.makeResponse.fail(res, 422, 'Device is not active');
        return;
      }

      const method = api.contracts.devices.methods.deactivateDevice();
      api.sendUnsignedMethodTransaction(res, req, method, api.contracts.devices);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });
};
