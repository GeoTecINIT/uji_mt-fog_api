const os = require('os');
const { stdout } = require('process');
const readline = require('readline-sync');

const readConfig = require('../utils/config');
const createWeb3Instance = require('../utils/web3');
const encodersFunctions = require('../utils/encoders');
const decodersFunctions = require('../utils/decoders');

const sendTransaction = method => new Promise((resolve, reject) => {
  try {
    method().on('transactionHash', hash => {
      resolve(hash);
    }).on('error', err => {
      reject(err);
    });
  } catch (err) {
    reject(err);
  }
});

const config = readConfig();
const web3 = createWeb3Instance(config.blockchainNetwork.config);
const encoders = encodersFunctions();
const decoders = decodersFunctions(web3);

const regionsContract = new web3.eth.Contract(config.contracts.Regions.abi, config.contracts.Regions.address);

const ips = {ipv4: null, ipv6: null};
const networkInterfaces = os.networkInterfaces();
if (networkInterfaces[config.host.networkInterface]) {
  const interfaceIps = networkInterfaces[config.host.networkInterface];
  const ipv4 = interfaceIps.filter(i => i.family === 'IPv4');
  const ipv6 = interfaceIps.filter(i => i.family === 'IPv6');
  ips.ipv4 = ipv4.length ? ipv4[0].address : null;
  ips.ipv6 = ipv6.length ? ipv6[0].address : null;
}

console.log(`IPv4: ${ips.ipv4 ? ips.ipv4 : '-'}, IPv6: ${ips.ipv6 ? ips.ipv6 : '-'}`);
console.log('');

(async() => {
  const myAddress = config.blockchainNetwork.config.address;
  const password = readline.question('Unlock password: ', {hideEchoBack: true});
  console.log(`Address: `);
  stdout.write('Unlocking account...');
  await web3.eth.personal.unlockAccount(myAddress, password, 60);
  console.log('ok');

  const regions = (await regionsContract.methods.getRegionsList().call()).map(r => decoders.regionMetadata(r));
  const ipv4 = encoders.ipv4(ips.ipv4);
  const ipv6 = encoders.ipv6(ips.ipv6);

  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    if (region.registrar === myAddress) {
      try {
        stdout.write(`Updating region #${region.id} "${region.name}"...`);
        const method = () => regionsContract.methods.updateRegionIPs(region.id, ipv4, ipv6).send({from: myAddress});
        const hash = await sendTransaction(method);
        console.log(`Transaction Sent (${hash})`);
      } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
      }
    }
  }
})();

console.log('FINISHED');
