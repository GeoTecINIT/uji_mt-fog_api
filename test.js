const Web3 = require('web3');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));

const web3 = new Web3(new Web3.providers.HttpProvider(`http://${config.blockchainNetwork.config.host}:${config.blockchainNetwork.config.port}`));
