var url = require('url');
var filed = require('filed');
var fs = require('fs');
var logDriver = require('log-driver');
var logger = logDriver({ level : false });

var index = null;

function getIndex(mount_path, api_path, title, cb){
  logger.info("getIndex");
  if (index){
    return cb(null, index);
  }
  var indexPath = __dirname + '/./static/index.html';
  logger.info("indexPath: ", indexPath);
  fs.readFile(indexPath, 'utf-8', function (err, data) {
    if (err) {
      return cb(err);
    }
    data = data.replace(/\$\$MOUNT_PATH\$\$/g, mount_path);
    data = data.replace(/\$\$API_PATH\$\$/g, api_path);
    data = data.replace(/\$\$TITLE\$\$/g, title);
    return cb(null, data);
  });
}

module.exports = function(options){
  options = options || {};
  api_path = options.api_path || '/api';
  browser_path = options.browser_path || api_path + '/browser';
  title = options.title || 'hyper+json browser';
  logger = logDriver( { level : (options.logLevel || false) });
  mount_path = browser_path.replace(/^\//, '');
  api_path = api_path.replace(/^\//, '');
  return function(req, res, next){
    var pathname = url.parse(req.url).pathname;
    var current_path = pathname.replace(/^\//, ''); // remove leading slash
    current_path = current_path.replace(/\/$/, ''); // remove trailing slash
    logger.info('current_path: ', current_path, "mount_path: ", mount_path);
    if (!startsWith(current_path, mount_path)){
      return next();
    }
    var subpath = current_path.substring(mount_path.length);
    logger.info("HIT sub path: ", subpath);
    if (!subpath || subpath === ''){
      // this is an index request
      if (!endsWith(pathname, '/')){
        // Redirect into the subdir if the url doesn't end with a slash
        // This is necessary for relative paths to work.
        res.setHeader('Location', pathname + '/');
        res.writeHead(301);
        return res.end();
      }
      getIndex(mount_path, api_path, title, function(err, data){
        if (err){
          return res.end(JSON.stringify(err));
        }
        res.write(data);
        return res.end();
      });
    } else {
      subpath = __dirname + '/./static/' + subpath;
      filed(subpath).pipe(res);
    }
  };
};

var startsWith = function(haystack, needle){
  return haystack.substring(0, needle.length) === needle;
};

var endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};
