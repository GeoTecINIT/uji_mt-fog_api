const registrables = [
  './methods',
  './balanceControllers',
  './deviceControllers',
  './miningControllers',
  './networkControllers',
  './regionControllers',
  './transactionControllers',
  './utilsControllers'
];

module.exports = api => {
  registrables.forEach(registrablePath => {
    const registrable = require(registrablePath);
    registrable(api);
  });
};
