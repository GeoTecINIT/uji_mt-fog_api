module.exports = api => {
  api.decoders = {};

  api.decoders.ipv4 = str => parseInt(str).toString(16).padStart(8, '0').match(/.{1,2}/g)
    .map(x => parseInt(x, 16).toString(10)).join('.');

  api.decoders.ipv6 = str => api.web3.utils.toHex(str).substr(2).padStart(32, '0').match(/.{1,4}/g)
    .map(x => parseInt(x, 16).toString(16)).join(':');

  api.decoders.serviceName = name => api.web3.utils.toHex(name).substr(2).padStart(8, '0').match(/.{1,2}/g)
    .map(x => String.fromCharCode(parseInt(x, 16))).join('');

  api.decoders.regionMetadata = regionMetadata => ({
    id: regionMetadata['id'],
    registrar: regionMetadata['registrar'],
    name: api.web3.utils.hexToUtf8(regionMetadata['name']),
    ipv4: api.decoders.ipv4(regionMetadata['ipv4']),
    ipv6: api.decoders.ipv6(regionMetadata['ipv6'])
  });

  api.decoders.region = region => ({
    metadata: api.decoders.regionMetadata(region['metadata']),
    cellIDs: region['cellIDs'].map(c => api.utils.toCellID(c)),
    failedCellIDs: region['failedCellIDs'].map(c => api.utils.toCellID(c))
  });

  api.decoders.device = device => ({
    addr: device['addr'],
    services: device['services'].map(s => api.decoders.serviceName(s)),
    lastUpdatedEpoch: new Date(device['lastUpdatedEpoch']),
    location: api.utils.toCellID(device['location']),
    ipv4: api.decoders.ipv4(device['ipv4']),
    ipv6: api.decoders.ipv6(device['ipv6']),
    active: device['active']
  });
};
