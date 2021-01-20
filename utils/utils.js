module.exports = () => {
  utils = {};

  utils.toCellID = str => {
    if (str.startsWith('0x')) {
      return str.padEnd(18, '0');
    }
    return '0x' + parseInt(str).toString(16).padEnd(18, '0');
  };

  utils.hexToBytes = hexString => {
    hexString = hexString.substr(2);
    if (hexString.length % 2 === 1) {
      hexString = '0' + hexString;
    }
    return hexString.match(/.{1,2}/g).map(x => parseInt(x, 16));
  };
  utils.bytesToHex = bytes => '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');

  utils.bufferToHex = buffer => utils.bytesToHex(Array.from(buffer));
  utils.hexToBuffer = hex => Buffer.from(utils.hexToBytes(hex));

  return utils;
};
