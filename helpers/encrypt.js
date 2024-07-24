const crypto = require('crypto');
// Example function to generate server seed (replace with your own method)
function generateServerSeed() {
    // Generate a random string as server seed (example)
    return crypto.randomBytes(16).toString('hex');
  }

  module.exports = {
    generateServerSeed
  };
  