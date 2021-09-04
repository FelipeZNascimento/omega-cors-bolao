const NodeCache = require('node-cache');
const CACHE_KEYS = require('../const/cacheValues');
const cachedInfo = new NodeCache();

module.exports = cachedInfo;
