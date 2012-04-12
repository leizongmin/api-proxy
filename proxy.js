/**
 * 代理请求
 */
 
var http = require('http');
var url = require('url');
var config = require('./config');
var log = config.log;
var error = config.error;


var proxy = module.exports;

/**
 * 代理请求
 *
 * @param {object} req
 * @param {object} res
 * @param {function} callback
 */
exports.request = function (req, res, callback) {
  var reqInfo = req.method + ' "' + req.url + '" ' + req.connection.remoteAddress;
  log('[Request]  ' + reqInfo);
  
  // 构造请求参数
  var urlInfo = url.parse(req.url);
  var options = {
    host:       config.API_HOST,
    hostname:   config.API_HOSTNAME,
    port:       config.API_PORT,
    method:     req.method,
    path:       urlInfo.path
  };
  
  // 接收POST数据
  var postData = [];
  req.on('data', function (chunk) {
    postData.push(chunk);
  });
  req.on('end', function () {
    postData = joinBuffer(postData);
  });
  
  // 发送请求
  var remoteReq = http.request(options, function (remoteRes) {
    log('[Response] ' + remoteRes.statusCode + ' ' + reqInfo);
    
    var resData = [];
    remoteRes.on('data', function (chunk) {
      resData.push(chunk);
    });
    remoteRes.on('end',function(){
      var data = {
        statusCode: remoteRes.statusCode,           // 响应代码
        headers:    remoteRes.headers,              // 响应头
        body:       joinBuffer(resData).toString()  // 响应数据
      };
      proxy.response(res, data);
      return callback(null, data);
    });
  });
  
  // 如果是GET或HEAD请求
  if (req.method === 'GET' || req.method === 'HEAD') {
    remoteReq.end();
  }
  else {
    if (Buffer.isBuffer(postData))
      remoteReq.end(postData);
    else
      req.on('end', function () {
        remoteReq.end(postData);
      });
  }
  
  remoteReq.on('error', function(err) {
    return callback(err);
  });
}

/**
 * 响应代理请求
 *
 * @param {object} res
 * @param {object} data
 */
exports.response = function (res, data) {
  var headers = data.headers;
  res.writeHead(data.statusCode, headers);
  res.end(data.body);
}


var joinBuffer = function (bufs) {
  var len = 0;
  for (var i in bufs)
    len += bufs[i].length;
  var ret = new Buffer(len);
  var offset = 0;
  for (var i in bufs) {
    bufs[i].copy(ret, offset, 0);
    offset += bufs[i].length;
  }
  return ret;
}