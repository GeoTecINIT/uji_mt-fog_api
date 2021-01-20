const os = require('os');
const fs = require('fs');
const readline = require('readline-sync');
const readConfig = require('../utils/config');

const networkInterfaces = os.networkInterfaces();
const networkInterfaceNames = Object.keys(networkInterfaces);

console.log('Choose network interface:');
console.log(networkInterfaceNames.map((n, i) => `[${i}] ${n}`).join('\n'));

const i = readline.question(`Choose network interface (0~${networkInterfaceNames.length - 1}): `);

if (!networkInterfaceNames[i]) {
  throw 'Invalid input';
}

const apiConfig = readConfig();
apiConfig.host.networkInterface = networkInterfaceNames[i];

fs.writeFileSync('./config.json', JSON.stringify(apiConfig));
