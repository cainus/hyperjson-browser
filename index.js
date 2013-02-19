var url = require('url');
var filed = require('filed');
var fs = require('fs');

var index = null;

function getIndex(mount_path, api_path, cb){
  if (index){
    return cb(null, index);
  }
  fs.readFile('./static/index.html', 'utf-8', function (err, data) {
    if (err) {
      return cb(err);
    }
    data = 
    data = data.replace(/\$\$MOUNT_PATH\$\$/, mount_path);
    data = data.replace(/\$\$API_PATH\$\$/, api_path);
    return cb(null, data);
  });
}

module.exports = function(mount_path, api_path){
  return function(req, res, next){
    console.log(req.url);
    var pathname = url.parse(req.url).pathname;
    var pieces = pathname.split('/');
    console.log(pieces);
    var prefix;
    while (!prefix){
      prefix = pieces.shift();
    }
    if (prefix !== mount_path){
      return next();
    }
    console.log("sub path!");
    var subpath = pieces.join("/");
    if (subpath === ''){
      getIndex(mount_path, api_path, function(err, data){
        if (err){
          return res.end(err);
        }
        res.write(data);
        return res.end();
      });
    } else {
      subpath = './static/' + subpath;
      filed(subpath).pipe(res);
    }
  };
};
