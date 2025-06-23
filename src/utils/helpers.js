const crypto = require('crypto');

/**
 * Gera uma API Key segura e aleatória.
 * @returns {string} Uma string hexadecimal de 64 caracteres.
 */
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  generateApiKey,
}; 