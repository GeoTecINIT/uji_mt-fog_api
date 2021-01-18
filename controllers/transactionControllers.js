const Tx = require('ethereumjs-tx').Transaction;

module.exports = api => {
  api.get('/transaction/get/:hash', async(req, res) => {
    try {
      const transaction = await api.web3.eth.getTransaction(req.params.hash);
      api.makeResponse.success(res, transaction);
    } catch (error) {
      api.makeResponse.fail(res, 500, 'Cannot get transaction', error);
      return;
    }
  });

  api.post('/transaction/send', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['to', 'value'])) {
        return;
      }
      
      const value = req.body.unit ? api.web3.utils.toWei(req.body.value.toString(), req.body.unit) : req.body.value;

      if (!api.unlockAccount(res, req)) {
        return;
      }

      const method = () => api.web3.eth.sendTransaction({
        from: api.apiConfig.blockchainNetwork.config.address,
        to: req.body.to,
        value: value
      });

      api.sendTransaction(res, req, method);
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });

  api.post('/transaction/send-raw', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['data'])) {
        return;
      }

      const method = () => api.web3.eth.sendSignedTransaction(req.body.data);
      api.sendTransaction(res, req, method);
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  });

  api.post('/transaction/submit-signature', async(req, res) => {
    try {
      if (!api.checkRequestBody(res, req.body, ['tx', 'r', 's', 'v'])) {
        return;
      }
      if (!api.unsignedTransactions[req.body.tx]) {
        api.makeResponse.fail(res, 404, 'Transaction hash not found');
        return;
      }

      const tx = new Tx({
        ...api.unsignedTransactions[req.body.tx],
        r: api.utils.hexToBuffer(req.body.r),
        s: api.utils.hexToBuffer(req.body.s),
        v: api.utils.hexToBuffer(req.body.v)
      }, {common: api.common});

      console.log(api.utils.bufferToHex(tx.r));
      console.log(api.utils.bufferToHex(tx.s));
      console.log(api.utils.bufferToHex(tx.v));

      console.log('addr:' + api.utils.bufferToHex(tx.getSenderAddress()));
      console.log('pubk:' + api.utils.bufferToHex(tx.getSenderPublicKey()));
      if (!tx.verifySignature()) {
        api.makeResponse.fail(res, 401, 'Signature invalid');
        return;
      }

      // api.makeResponse.fail(res, 500, 'Not implmented');

      const rawTransaction = '0x' + tx.serialize().toString('hex');
      const method = () => api.web3.eth.sendSignedTransaction(rawTransaction);
      api.sendTransaction(res, req, method, false);

      delete api.unsignedTransactions[req.body.tx];
    } catch (error) {
      api.makeResponse.fail(res, 500, 'ERROR', error);
    }
  });
};
