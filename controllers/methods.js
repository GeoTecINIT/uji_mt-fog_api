const Tx = require('ethereumjs-tx').Transaction;

module.exports = api => {
  api.makeResponse = {
    success: (response, data = null) => {
      response.status(200).type('application/json');
      response.send({
        ok: true,
        msg: null,
        data: data
      });
    },
    fail: (response, status, message, data = null) => {
      if (data instanceof Error) {
        console.error(data);
        data = data.toString();
      }
      response.status(status).type('application/json');
      response.send({
        ok: false,
        msg: message,
        data: data
      });
    }
  };

  api.checkRequestBody = (res, reqBody, requireFields) => {
    for (let i = 0; i < requireFields.length; i++) {
      if (typeof reqBody[requireFields[i]] === 'undefined') {
        api.makeResponse.fail(res, 400, `Field "${requireFields[i]}" not found in request body`);
        return false;
      }
    }
    return true;
  };

  api.unlockAccount = async(res, req, time = 60) => {
    address = req.get('Address');
    if (!address) {
      address = api.apiConfig.blockchainNetwork.config.address;
    }

    try {
      const unlock = await api.web3.eth.personal.unlockAccount(address, req.get('UnlockPassword'), time);
      return unlock ? true : false;
    } catch (error) {
      console.error(`Error unlocking account ${address} (${error})`);
      api.makeResponse.fail(res, 401, 'Cannot unlock account', error);
      return false;
    }
  }

  api.sendContractTransaction = (res, req, method, options = null, autoUnlock = true) => {
    if (!options) {
      options = {};
    }
    if (!options.from) {
      options.from = api.apiConfig.blockchainNetwork.config.address;
    }

    api.sendTransaction(res, req, () => method.send(options), autoUnlock);
  };

  api.sendTransaction = (res, req, sendMethod, autoUnlock = true) => {
    let responded = false;
    const fail = err => {
      if (!responded) {
        api.makeResponse.fail(res, 500, 'Cannot process transaction', err);
        responded = true;
      }
    };

    try {
      if (autoUnlock && !api.unlockAccount(res, req)) {
        return;
      }

      sendMethod().on('transactionHash', hash => {
        api.makeResponse.success(res, {
          transactionHash: hash
        });
        responded = true;
      }).on('error', error => {
        fail(error);
      });
    } catch (error) {
      fail(error);
    }
  };

  api.sendUnsignedMethodTransaction = async(res, req, method, contract) => {
    try {
      const address = req.get('Address');
      if (!address) {
        api.makeResponse.fail(res, 400, 'Invalid sender address', 'Require "Address" in request header');
        return;
      }

      console.log(api.web3.eth.accounts.privateKeyToAccount('0x0e429188f29cd39c262eaac95a03f6bb6c4dea91091377c98073443ccfabea91'));
  
      const abi = method.encodeABI();
      const gas = await method.estimateGas({from: req.get('Address')});
  
      const nonce = (await api.web3.eth.getTransactionCount(req.get('Address')));
      const gasPrice = (await api.web3.eth.getGasPrice());
  
      const txData = {
        nonce: `${api.web3.utils.toHex(nonce)}`,
        gasPrice: `${api.web3.utils.toHex(gasPrice)}`,
        gasLimit: `${api.web3.utils.toHex(gas)}`,
        to: contract.options.address,
        value: 0,
        data: abi
      };

      const tx = new Tx(txData, {common: api.common});
      const hashHex = api.utils.bufferToHex(tx.hash(false));

      api.unsignedTransactions[hashHex] = txData;
  
      api.makeResponse.success(res, {
        raw: tx.raw.map(x => api.utils.bufferToHex(x)),
        hash: hashHex,
        chainID: api.chainID
      });
    } catch (err) {
      api.makeResponse.fail(res, 500, 'ERROR', err);
    }
  };
};
