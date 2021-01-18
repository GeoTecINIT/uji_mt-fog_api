const s2base64tree = require('s2base64tree');

module.exports = api => {
  api.post('/utils/chunk-tree', (req, res) => {
    if (!api.checkRequestBody(res, req.body, ['data'])) {
      return;
    }

    try {
      if (!req.body.data.startsWith('0x')) {
        api.makeResponse.fail(res, 400, 'Data must start with 0x');
        return;
      }

      const chunks = s2base64tree.chunk(api.utils.hexToBytes(req.body.data), 128);

      api.makeResponse.success(res, chunks.map(c => api.utils.bytesToHex(c)));
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });
};
