const Web3 = require('web3');

const fs = require('fs');

(async() => {
  const config = JSON.parse(fs.readFileSync('./config.json'));
  const web3 = new Web3(`http://${config.blockchainNetwork.config.host}:${config.blockchainNetwork.config.port}`);
  const accounts = await web3.eth.getAccounts();
  config.blockchainNetwork.config.address = accounts[0];
  fs.writeFileSync('./config.json', JSON.stringify(config));
})();
