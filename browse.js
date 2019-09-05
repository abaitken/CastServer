function ProcessRequest(objectId, callback)
{
    var request = require('request-promise-native');

    var requestBody =
      '<?xml version="1.0"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
      '<s:Body>' +
        '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
          '<ObjectID>' + objectId + '</ObjectID>' +
          '<BrowseFlag>BrowseDirectChildren</BrowseFlag>' +
          '<Filter>*</Filter>' +
          '<StartingIndex>0</StartingIndex>' +
          '<RequestedCount>0</RequestedCount>' +
          '<SortCriteria></SortCriteria>' +
        '</u:Browse>' +
      '</s:Body>' +
    '</s:Envelope>';

    var requestHeaders = {
      'cache-control': 'no-cache',
      'soapaction': 'urn:schemas-upnp-org:service:ContentDirectory:1#Browse',
      'content-type': 'text/xml;charset=UTF-8'
    };

    var requestOptions = {
      'method': 'POST',
      'url': 'http://dnla.services.lan/ctl/ContentDir',
      'qs': { 'wsdl': ''},
      'headers': requestHeaders,
      'body': requestBody,
      'timeout': 5000
    };

    request(requestOptions).then(function (body) {
        
        
        var decode = require('unescape');
        const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
        var match = getResultRegex.exec(body);
        var data = decode(match['groups']['DATA']);
        
        var xml2js = require('xml2js');
        var parser = new xml2js.Parser({explicitArray : false});
        
        let jsonData;
        parser.parseString(data, function (err, parseResult) {
            jsonData = parseResult['DIDL-Lite'];
        });
        
        //console.log(jsonData);
        var containers = new Array();
        var items = new Array();
        
        if(jsonData['container'])
            jsonData['container'].forEach(function(item) {
               containers.push(item); 
            });
        if(jsonData['item'])
            jsonData['item'].forEach(function(item) {
               items.push(item); 
            });
        
        var result = {
            'container': containers,
            'item': items
        };
        
        callback(result);
    }).catch(function(error){
        console.log(error);
    });
}


module.exports = function(app) {
    app.get("/browse/:path", (req, res, next) => {
     ProcessRequest(req.params['path'], function(data){
        res.json(data);
     });
    });
    
    app.get("/browse", (req, res, next) => {
     ProcessRequest('0', function(data){
        res.json(data);
     });
    });
};

