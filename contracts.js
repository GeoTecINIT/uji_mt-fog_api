const contracts = [
  {name: 'Regions', instance: 'regions'},
  {name: 'Devices', instance: 'devices'},
  {name: 'ReputationManagement', instance: 'reputationManagement'}
];

module.exports = api => {
  api.contracts = {};

  contracts.forEach(contract => {
    if (!api.apiConfig.contracts[contract.name]) {
      throw `${contract.name} contract configuration is not found`;
    }

    api.contracts[contract.instance] = new api.web3.eth.Contract(
      api.apiConfig.contracts[contract.name].abi,
      api.apiConfig.contracts[contract.name].address
    );
  });
};
