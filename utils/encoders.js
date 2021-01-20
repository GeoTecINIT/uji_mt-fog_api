module.exports = () => {
  encoders = {};

  encoders.ipv4 = ipv4 => ipv4 ?
    ('0x' + ipv4.split('.').map(x => parseInt(x, 10).toString(16).padStart(2, '0')).join('')) : '0';
  encoders.ipv6 = ipv6 => ipv6 ?
    ('0x' + ipv6.split(':').map(x => x.padStart(4, '0')).join('')) : '0';

  encoders.serviceName = serviceName => {
    if (serviceName.length !== 4) {
      throw 'Invalid service name: ' + serviceName;
    }
    return '0x' + Array.from(serviceName).map(x => x.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  };

  return encoders;
};
