var http = require('http');
var url = require('url');
var config = require('./config');
var proxy = require('./proxy');
var cache = require('./cache');
var log = config.log;
var error = config.error;


// �������
var requestCount = 0;

http.createServer(function (req, res) {
  var reqInfo = req.method + ' "' + req.url + '" ' + req.connection.remoteAddress;
  
  // ֻ���GET��HEAD������л���
  if (req.method === 'GET' || req.method === 'HEAD') {
    cache.get(req.url, function (err, data) {
      if (err) {
        proxy.request(req, res, function (err, data) {
          cache.put(req.url, data, function (err) {
            if (err)
              return error(err);
          });
        });
      }
      else {
        log('[cache]    ' + reqInfo);
        proxy.response(res, data);
      }
    });
  }
  else {
    proxy.request(req, res, function (err, data) {
      // 
    });
  }
  
  // ������
  requestCount++;
  if (requestCount % 2 === 200) {
    log('clear cache...');
    cache.clear(function (err) {
      if (err)
        error(err);
    });
  } 
  
}).listen(config.SERVER_PORT);

log('Server running on port ' + config.SERVER_PORT);

process.on('uncaughtException', function (err) {
  error(err);
});