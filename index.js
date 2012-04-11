var http = require('http');
var url = require('url');


// 配置
var config = {
  MAX_SOCKETS:      10240,              // 最大socket连接数
  API_HOST:         '199.36.72.229',    // 远程服务器IP
  API_PORT:         8080,               // 远程服务器端口
  API_TIMEOUT:      10000,              // 请求API超时（毫秒）
  SERVER_PORT:      80                  // 本地服务器端口
};


http.globalAgent.maxSockets = config.MAX_SOCKETS;

var requestCount = 0;

var log = function (msg, isError) {
  var now = new Date();
  var time = now.toDateString() + ' ' + now.toLocaleTimeString();
  if (isError)
    console.error(time + ' -- ' + (msg.stack || msg));
  else
    console.log(time + ' -- ' + msg);
}


http.createServer(function(req,res){
  var reqInfo = req.method + ' "' + req.url + '" ' + req.connection.remoteAddress;
  log('[Request]  ' + reqInfo);
  
  requestCount++;

  // 构造请求参数
  var urlInfo = url.parse(req.url);
  var options = {
    host:       config.API_HOST,
    hostname:   config.API_HOST,
    port:       config.API_PORT,
    method:     req.method,
    path:       urlInfo.path,
    Connection: 'keep-alive'
  };
  
  // 发送请求
  var remoteReq = http.request(options, function (remoteRes) {
    log('[Response] ' + remoteRes.statusCode + ' ' + reqInfo);
    
    var headers = remoteRes.headers;
    headers['X-Request-Count'] = requestCount;
    res.writeHead(remoteRes.statusCode, headers);
    remoteRes.on('data', function (chunk) {
      res.write(chunk);
    });
    remoteRes.on('end',function(){
      res.end();
    });
  });
  
  remoteReq.on('error', function(err) { 
    log(err, true);
  });
  
  remoteReq.end();
  
}).listen(config.SERVER_PORT);

log('Server running on port ' + config.SERVER_PORT);

process.on('uncaughtException', function (err) {
  log(err, true);
});