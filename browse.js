function ProcessRequest(objectId, callback) {
  var request = require("request-promise-native");

  var requestBody =
    '<?xml version="1.0"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    "<s:Body>" +
    '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
    "<ObjectID>" +
    objectId +
    "</ObjectID>" +
    "<BrowseFlag>BrowseDirectChildren</BrowseFlag>" +
    "<Filter>*</Filter>" +
    "<StartingIndex>0</StartingIndex>" +
    "<RequestedCount>0</RequestedCount>" +
    "<SortCriteria></SortCriteria>" +
    "</u:Browse>" +
    "</s:Body>" +
    "</s:Envelope>";

  var requestHeaders = {
    "cache-control": "no-cache",
    soapaction: "urn:schemas-upnp-org:service:ContentDirectory:1#Browse",
    "content-type": "text/xml;charset=UTF-8"
  };

  var requestOptions = {
    method: "POST",
    url: "http://dnla.services.lan/ctl/ContentDir",
    qs: { wsdl: "" },
    headers: requestHeaders,
    body: requestBody,
    timeout: 5000
  };

  request(requestOptions)
    .then(function(body) {
      var decode = require("unescape");
      const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
      var match = getResultRegex.exec(body);
      var data = decode(match["groups"]["DATA"]);

      var xml2js = require("xml2js");
      var parser = new xml2js.Parser({ explicitArray: false });

      let jsonData;
      parser.parseString(data, function(err, parseResult) {
        jsonData = parseResult["DIDL-Lite"];
      });

      var result = {
        container: jsonData["container"],
        item: jsonData["item"]
      };

      callback(result);
    })
    .catch(function(error) {
      console.log(error);
    });
}

module.exports = function(app) {
  app.get("/browse/:id", (req, res, next) => {
    ProcessRequest(req.params["id"], function(data) {
      res.json(data);
    });
  });

  app.get("/browse", (req, res, next) => {
    ProcessRequest("0", function(data) {
      res.json(data);
    });
  });

  app.get("/info/:id", (req, res, next) => {
    var lastPosition = req.params["id"].lastIndexOf("$");
    var parentId = req.params["id"].substr(0, lastPosition);

    ProcessRequest(parentId, function(data) {
      if (data["item"]) {
        for (var index = 0; index < data["item"].length; index++) {
          var item = data["item"][index];

          if (item["$"]["id"] == req.params["id"]) {
            res.json(item);
            return;
          }
        }
      }
      if (data["container"]) {
        for (var index = 0; index < data["container"].length; index++) {
          var item = data["container"][index];
          if (item["$"]["id"] == req.params["id"]) {
            res.json(item);
            return;
          }
        }
      }

      res.json({});
    });
  });
};
