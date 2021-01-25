const s2base64tree = require('s2base64tree');
const base64 = require('s2base64tree/base64');

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

  api.post('/utils/make-trees', (req, res) => {
    if (!api.checkRequestBody(res, req.body, ['cellIDs'])) {
      return;
    }

    try {
      const cellIDs = req.body.cellIDs
        .map(hex => {
          return api.utils.toFullCellID(hex)
            .substr(2).match(/.{1,2}/g)
            .map(x => parseInt(x, 16).toString(2).padStart(8, '0')).join('')
            .replace(/0+$/g, '')
            .match(/.{1,6}/g)
            .map(bin => base64.encoders[parseInt(bin.padEnd(6, '0'), 2)]).join('');
        });
      
      const tree = s2base64tree.makeTree(cellIDs);
      const encoded = s2base64tree.encoder.encode(tree);
      const chunks = s2base64tree.chunk(encoded, 128);
      
      api.makeResponse.success(res, chunks.map(chunk => api.utils.bytesToHex(chunk)));
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });
};
