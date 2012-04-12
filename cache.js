/**
 * 缓存
 */
 

var config = require('./config');
var log = config.log;
var error = config.error;
var md5 = config.md5;
var DB_CACHE = config.DB_CACHE;


/**
 * 保存缓存
 *
 * @param {string} url
 * @param {object} data
 * @param {function} callback
 */
exports.put = function (url, data, callback) {
  var timestamp = new Date().getTime();
  DB_CACHE.save({
    url:        url,
    timestamp:  timestamp,
    data:       data
  }, function (err) {
    return callback(err);
  })
}

/**
 * 取缓存
 *
 * @param {string} url
 * @param {function} callback
 */
exports.get = function (url, callback) {
  var timestamp = new Date().getTime();
  var since = timestamp - config.CACHE_MAXAGE;
  DB_CACHE.findOne({
    url:        url,
    timestamp:  { $gt: since }
  }, function (err, data) {
    if (err)
      return callback(err);
    if (!data || !data.data)
      return callback(Error('No cache.'));
    else
      return callback(null, data.data);
  });
}

/**
 * 清理缓存
 *
 * @param {int} since
 * @param {function} callback
 */
exports.clear = function (since, callback) {
  var timestamp = new Date().getTime();
  if (typeof since === 'function') {
    callback = since;
    since = timestamp - config.CACHE_MAXAGE;
  }
  DB_CACHE.remove({timestamp:  { $lt: since }}, callback);
}
