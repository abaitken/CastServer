function RestructureContainer(item) {
  
  return {
    id: item['$']['id'],
    parentID: item['$']['parentID'],
    childCount: item['$']['childCount'],
    title: item['dc:title'],
    class: item['upnp:class'],
    // TODO : Can be an array!
    albumArtURI: ['upnp:albumArtURI']['_']
  };
}

function RestructureItem(item){
  return {
    id: item['$']['id'],
    parentID: item['$']['parentID'],
    title: item['dc:title'],
    creator: item['dc:creator'],
    artist: item['upnp:artist'],
    album: item['upnp:album'],
    genre: item['upnp:genre'],
    // TODO : Can be an array! for images
    res: item['res']['_'],
    class: item['upnp:class'],
    size: item['res']['$']['size'],
    duration: item['res']['$']['duration'],
    bitrate: item['res']['$']['bitrate'],
    sampleFrequency: item['res']['$']['sampleFrequency'],
    nrAudioChannels: item['res']['$']['nrAudioChannels'],
    protocolInfo: item['res']['$']['protocolInfo'],
    originalTrackNumber: item['upnp:originalTrackNumber'],
    albumArtURI: ['upnp:albumArtURI']['_']
  };
}

function RestructureEntities(o, redfineCallback) {
  var result = [];

  if (o) {
    if (Array.isArray(o)) {
      for (const key in o) {
        var item = o[key];
        result.push(redfineCallback(item));
      }
    }
    else {
      result.push(redfineCallback(o));
    }
  }
  return result;
}

function FetchDNLAData(objectId, callback) {
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
    .then(function (body) {
      var decode = require("unescape");
      const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
      var match = getResultRegex.exec(body);
      var data = decode(match["groups"]["DATA"]);

      var xml2js = require("xml2js");
      var parser = new xml2js.Parser({ explicitArray: false });

      let jsonData;
      parser.parseString(data, function (err, parseResult) {
        jsonData = parseResult["DIDL-Lite"];
      });

      callback(jsonData, null);
    })
    .catch(function (error) {
      callback(null, error);
    });
}

function CreateErrorResult(error){
  return {
    error: "TODO : More error details"
  };
}

function ProcessDNLAData(data)
{  
  var result = {
    container: RestructureEntities(data["container"], RestructureContainer),
    item: RestructureEntities(data["item"], RestructureItem)
  };
  return result;
}

module.exports = function (app) {

  app.get("/raw/:id", (req, res, next) => {
    FetchDNLAData(req.params["id"], function (data, error) {
      if(error)// TODO : Is this correct, doesnt seem to work
      {
        res.json(CreateErrorResult(error));
        return;
      }
      res.json(data);
    });
  });

  app.get("/raw", (req, res, next) => {
    FetchDNLAData("0", function (data, error) {
      if(error)// TODO : Is this correct, doesnt seem to work
      {
        res.json(CreateErrorResult(error));
        return;
      }
      res.json(data);
    });
  });


  app.get("/browse/:id", (req, res, next) => {
    FetchDNLAData(req.params["id"], function (data, error) {
      if(error)// TODO : Is this correct, doesnt seem to work
      {
        res.json(CreateErrorResult(error));
        return;
      }
      res.json(ProcessDNLAData(data));
    });
  });

  app.get("/browse", (req, res, next) => {
    FetchDNLAData("0", function (data, error) {
      if(error)// TODO : Is this correct, doesnt seem to work
      {
        res.json(CreateErrorResult(error));
        return;
      }
      res.json(ProcessDNLAData(data));
    });
  });

  app.get("/info/:id", (req, res, next) => {
    var lastPosition = req.params["id"].lastIndexOf("$");
    var parentId = req.params["id"].substr(0, lastPosition);

    FetchDNLAData(parentId, function (dnlaData, error) {
      
      if(error)// TODO : Is this correct, doesnt seem to work
      {
        res.json(CreateErrorResult(error));
        return;
      }

      var data = ProcessDNLAData(dnlaData);
      
      if (data["item"]) {
        for (var index = 0; index < data["item"].length; index++) {
          var item = data["item"][index];

          if (item["id"] == req.params["id"]) {
            res.json(item);
            return;
          }
        }
      }
      if (data["container"]) {
        for (var index = 0; index < data["container"].length; index++) {
          var item = data["container"][index];
          if (item["id"] == req.params["id"]) {
            res.json(item);
            return;
          }
        }
      }

      res.json({});
    });
  });
};
