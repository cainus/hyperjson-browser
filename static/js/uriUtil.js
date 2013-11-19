
var hasUriTemplate = function(href){
  return href.indexOf('{') !== -1;
};


var getUriParamNames = function(url){
         var urlParams = url.match(/{([^}]+)}/g);
         uriParamNames = [];
         _.each(urlParams, function(param){
           var name = param.slice(1, -1);
           uriParamNames.push(name);
         });
  return uriParamNames;
};
