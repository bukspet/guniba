const NodeCache = require("node-cache");

// stdTTL = 300 → items expire after 5 minutes
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

module.exports = localCache;
