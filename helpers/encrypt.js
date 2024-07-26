const crypto = require("crypto");
// Example function to generate server seed (replace with your own method)
function generateServerSeed() {
  // Generate a random string as server seed (example)
  return crypto.randomBytes(16).toString("hex");
}

function getRandomMultiplier(clientSeed, serverSeed) {
  const combinedSeed = serverSeed + "|" + clientSeed;
  const hash = crypto.createHash("sha256").update(combinedSeed).digest("hex");
  const rand = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
  const multiplier = Math.max(1, Math.exp(-Math.log(rand)));
  return parseFloat(multiplier.toFixed(2));
}

module.exports = {
  generateServerSeed,
  getRandomMultiplier,
};
