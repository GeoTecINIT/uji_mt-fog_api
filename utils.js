module.exports = api => {
  api.utils = {};

  api.utils.toCellID = str => {
    if (str.startsWith('0x')) {
      return str.padEnd(18, '0');
    }
    return '0x' + parseInt(str).toString(16).padEnd(18, '0');
  };

  api.utils.hexToBytes = hexString => {
    hexString = hexString.substr(2);
    if (hexString.length % 2 === 1) {
      hexString = '0' + hexString;
    }
    return hexString.match(/.{1,2}/g).map(x => parseInt(x, 16));
  };
  api.utils.bytesToHex = bytes => '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');

  api.utils.bufferToHex = buffer => api.utils.bytesToHex(Array.from(buffer));
  api.utils.hexToBuffer = hex => Buffer.from(api.utils.hexToBytes(hex));
};
