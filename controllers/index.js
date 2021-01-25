const registrables = [
  './methods',
  './balanceControllers',
  './deviceControllers',
  './miningControllers',
  './networkControllers',
  './regionControllers',
  './reputationControllers',
  './serviceControllers',
  './transactionControllers',
  './utilsControllers',
  './otherControllers',
];

module.exports = api => {
  registrables.forEach(registrablePath => {
    const registrable = require(registrablePath);
    registrable(api);
  });
};
