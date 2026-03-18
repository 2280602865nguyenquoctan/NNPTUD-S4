const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

let privateKey, publicKey;
try {
    privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'private.key'), 'utf8');
    publicKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'public.key'), 'utf8');
} catch (error) {
    console.error("Warning: keys not generated yet. Please run generate_keys.js");
}

const JWT_OPTIONS = {
  algorithm: 'RS256',
  expiresIn: '1h'
};

function signAccessToken(payload) {
  return jwt.sign(payload, privateKey, JWT_OPTIONS);
}

function verifyAccessToken(token) {
  return jwt.verify(token, publicKey, {
    algorithms: ['RS256']
  });
}

module.exports = {
  signAccessToken,
  verifyAccessToken
};
