module.exports = api => {
  api.get('/region/get/:id', async(req, res) => {
    try {
      const region = api.decoders.region(await api.contracts.regions
        .methods.getRegionData(req.params.id).call());
      
      if (!region.metadata.id) {
        api.makeResponse.fail(res, 404, `Region ID ${req.params.id} not found`);
        return;
      }

      api.makeResponse.success(res, region);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'Cannot get region', error);
    }
  });

  api.get('/region/query/:cellID', async(req, res) => {
    try {

      let cellID = api.utils.toFullCellID(req.params.cellID);

      if (!cellID) {
        api.makeResponse.fail(res, 400, `Cell ID ${cellID} ?`);
        return;
      }

      const regionMetadata = api.decoders.regionMetadata(
        await api.contracts.regions.methods.query(cellID).call()
      );

      if (regionMetadata.id > 0) {
        api.makeResponse.success(res, regionMetadata);
      } else {
        api.makeResponse.fail(res, 404, `Region not found at ${cellID}`);
      }
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });

  api.get('/region/:regionID/devices', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.params, ['regionID'])) {
        return;
      }

      const method = req.query.service ?
         api.contracts.regions.methods.getDevicesInRegionWithService(req.params.regionsID, req.query.service) :
         api.contracts.regions.methods.getDevicesInRegion(req.params.regionsID);

      const devices = (await method.call())
        .map(d => api.decoders.device(d));
      api.makeResponse.success(res, devices);
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });

  api.get('/region/:regionID/devices/:serviceName', async(req, res) => {
    // TODO: Implement
  });
  
  api.get('/regions/list', async(req, res) => {
    try {
      const regionsMetadata = await api.contracts.regions.methods.getRegionsList().call();
      api.makeResponse.success(res, regionsMetadata.map(r => api.decoders.regionMetadata(r)));
    } catch (error) {
      api.makeResponse.fail(res, 500, 'Cannot list regions', error);
    }
  });

  api.post('/region/add-cells', (req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['id', 'cellIDs'])) {
        return;
      }

      if (req.body.cellIDs.length > 64) {
        api.makeResponse.fail(res, 400, `Too many cells (limit = 64, current = ${req.body.cellIDs.length})`);
        return;
      }

      if (!api.unlockAccount(req, res)) {
        return;
      }

      const method = api.contracts.regions.methods.addRegionCells(req.body.id, req.body.cellIDs);
      api.sendContractTransaction(res, req, method);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/region/add-tree', (req, res) => {
    if (!api.checkRequestBody(res, req.body, ['id', 'data'])) {
      return;
    }

    try {
      const bytes = api.utils.hexToBytes(req.body.data);
      if (bytes.length > 128) {
        api.makeResponse.fail(res, 400, `Data is too large (128 bytes maximum, current = ${bytes.length}). `
          + 'Use chunk API to split the transactions.');
        return;
      }

      if (!api.unlockAccount(res, req)) {
        return;
      }

      const method = api.contracts.regions.methods.addTree(req.body.id, bytes.map(b => b.toString()));
      api.sendContractTransaction(res, req, method);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.post('/region/register', (req, res) => {
    if (!api.checkRequestBody(res, req.body, ['id', 'name', 'ipv4', 'ipv6'])) {
      return;
    }
    if (!api.unlockAccount(res, req)) {
      return;
    }

    try {
      const method = api.contracts.regions.methods.registerRegion(
        req.body.id,
        api.web3.utils.stringToHex(req.body.name),
        api.encoders.ipv4(req.body.ipv4),
        api.encoders.ipv6(req.body.ipv6)
      );
      api.sendContractTransaction(res, req, method);
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });

  api.post('/region/update-ip', (req, res) => {
    if (!api.checkRequestBody(res, req.body, ['id', 'ipv4', 'ipv6'])) {
      return;
    }
    if (!api.unlockAccount(res, req)) {
      return;
    }

    try {
      const ipv4 = api.encoders.ipv4(req.body.ipv4);
      const ipv6 = api.encoders.ipv6(req.body.ipv6);
      
      const method = api.contracts.regions.methods.updateRegionIPs(req.body.id, ipv4, ipv6);
      api.sendContractTransaction(res, req, method);
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });

  api.post('/region/update-name', (req, res) => {
    if (!api.checkRequestBody(res, req.body, ['id', 'name'])) {
      return;
    }
    if (!api.unlockAccount(res, req)) {
      return;
    }

    try {
      const newName = api.web3.utils.stringToHex(req.body.name);
      const method = api.contracts.regions.methods.updateRegionName(req.body.id, newName);
      api.sendContractTransaction(res, req, method);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });

  api.delete('region/clear-failed-cells', (req, res) => {
    // TODO: Implement
  });

  api.delete('/region/remove-cells', (req, res) => {
    // TODO: Implement
  });
};
