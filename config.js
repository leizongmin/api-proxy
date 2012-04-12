/**
 * 配置文件
 */
 
 
// 远程API配置
exports.MAX_SOCKETS   = 10240;              // 最大socket连接数
exports.API_HOST      = '110.76.47.99';     // 远程服务器IP
exports.API_HOSTNAME  = 'club.cnodejs.org'; // 远程主机名
exports.API_PORT      = 80;                 // 远程服务器端口
exports.API_TIMEOUT   = 10000;              // 请求API超时（毫秒）
exports.SERVER_PORT   = 80;                 // 本地服务器端口
exports.CACHE_MAXAGE  = 60000;              // 缓存生存时间
 
// 数据库配置
var mongo = require("mongoskin");
//var db_url = exports.db_url = "niz90sc9613s0:lgey2uelt6s@127.0.0.1:20088/EpRXiScEdfuj";
var db_url = exports.db_url = "127.0.0.1:27017/test";
exports.DB = mongo.db(db_url);
var db = exports.DB;

exports.DB_CACHE = db.collection('cache');



// 日志记录
exports.log = function (msg) {
  console.log(logTime() + ' [log]   ' + msg);
  logSource();
}
exports.error = function (err) {
  console.log(logTime() + ' [error] ' + (err.stack || err));
  logSource();
}
var logTime = function () {
  var now = new Date();
  var time = now.toDateString() + ' ' + now.toLocaleTimeString();
  return time;
}
var logSource = function () {
  return;
  var s = Error().stack.split('\n')[4];
  if (s)
    console.log(s);
}

// MD5
var crypto = require('crypto');
exports.md5 = function (text) {
  return crypto.createHash('md5').update(text).digest('hex');
}