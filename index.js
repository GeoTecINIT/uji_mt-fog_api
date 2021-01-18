const express = require('express');
const fs = require('fs');

const registerBlockchainNetwork = require('./blockchain');
const registerContracts = require('./contracts');
const registerDecoders = require('./decoders');
const registerEncoders = require('./encoders');
const registerUtils = require('./utils');
const registerControllers = require('./controllers');

const port = 80;

if (!fs.existsSync('./config.json')) {
  throw 'Config file (config.json) does not exist';
}

const api = express();
api.use(express.json());

api.apiConfig = JSON.parse(fs.readFileSync('./config.json'));
api.unsignedTransactions = {};

registerBlockchainNetwork(api);
registerContracts(api);
registerDecoders(api);
registerEncoders(api);
registerUtils(api);
registerControllers(api);

api.listen(api.apiConfig.api.port, () => {
  console.log(`API is listening at port ${port}`);
});
