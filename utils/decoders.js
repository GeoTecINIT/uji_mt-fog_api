module.exports = web3 => {
  decoders = {};

  decoders.cellID = cellID => '0x' + parseInt(cellID).toString(16).padStart(16, '0');

  decoders.ipv4 = str => parseInt(str).toString(16).padStart(8, '0').match(/.{1,2}/g)
    .map(x => parseInt(x, 16).toString(10)).join('.');

  decoders.ipv6 = str => web3.utils.toHex(str).substr(2).padStart(32, '0').match(/.{1,4}/g)
    .map(x => parseInt(x, 16).toString(16)).join(':');

  decoders.serviceName = name => web3.utils.toHex(name).substr(2).padStart(8, '0').match(/.{1,2}/g)
    .map(x => String.fromCharCode(parseInt(x, 16))).join('');

  decoders.regionMetadata = regionMetadata => ({
    id: regionMetadata['id'],
    registrar: regionMetadata['registrar'],
    name: web3.utils.hexToUtf8(regionMetadata['name']),
    ipv4: decoders.ipv4(regionMetadata['ipv4']),
    ipv6: decoders.ipv6(regionMetadata['ipv6'])
  });

  decoders.region = region => ({
    metadata: decoders.regionMetadata(region['metadata']),
    cellIDs: region['cellIDs'].map(c => decoders.cellID(c)),
    failedCellIDs: region['failedCellIDs'].map(c => decoders.cellID(c))
  });

  decoders.device = device => ({
    addr: device['addr'],
    services: device['services'].map(s => decoders.serviceName(s)),
    lastUpdatedEpoch: new Date(device['lastUpdatedEpoch']),
    location: decoders.cellID(device['location']),
    ipv4: decoders.ipv4(device['ipv4']),
    ipv6: decoders.ipv6(device['ipv6']),
    regionID: device['regionID'],
    active: device['active']
  });

  decoders.deviceReputation = deviceReputation => ({
    ...decoders.device(deviceReputation['device']),
    reputation: deviceReputation['reputation'] / 0xffffffffffffffff
  });

  decoders.reputation = reputation => ({
    value: reputation['value'] / 0xffffffffffffffff,
    timestamp: new Date(reputation['timestamp'] * 1000),
    records: reputation['records'].map((v, i) => ({timestamp: new Date(reputation['timestamps'][i] * 1000), value: v / 0xffffffffffffffff}))
  });

  return decoders;
};
