const crypto = require('crypto');
const fs = require('fs');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

if (!fs.existsSync('keys')) {
    fs.mkdirSync('keys');
}

fs.writeFileSync('keys/private.key', privateKey);
fs.writeFileSync('keys/public.key', publicKey);
console.log('Keys generated successfully in keys/ folder');
