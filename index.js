const express = require('express');
const fs = require('fs');

const readConfig = require('./utils/config');

const registerBlockchainNetwork = require('./blockchain');
const registerContracts = require('./contracts');
const decodersFunctions = require('./utils/decoders');
const encodersFunctions = require('./utils/encoders');
const utilsFunctions = require('./utils/utils');
const registerControllers = require('./controllers');

const port = 80;

if (!fs.existsSync('./config.json')) {
  throw 'Config file (config.json) does not exist';
}

const api = express();
api.use(express.json());

api.apiConfig = readConfig();
api.unsignedTransactions = {};

registerBlockchainNetwork(api);
registerContracts(api);
api.decoders = decodersFunctions(api.web3);
api.encoders = encodersFunctions();
api.utils = utilsFunctions();
registerControllers(api);

api.listen(api.apiConfig.api.port, () => {
  console.log(`API is listening at port ${port}`);
});
