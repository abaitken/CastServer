function RedefineContainer(item) {
  
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

function RedefineMusic(item){
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

function RedefineUnknown(item){
  return {
    id: item['$']['id'],
    parentID: item['$']['parentID'],
    title: item['dc:title'],
    class: item['upnp:class'],
  };
};

function RedefineItem(item){
  var classType = item['upnp:class'];
  if (classType.toLowerCase().indexOf('folder') !== -1) {
    return RedefineContainer(item);
  }

  if (classType.toLowerCase().indexOf('track') !== -1) {
    return RedefineMusic(item);
  }

  return RedefineUnknown(item);
}

function RestructureEntities(o) {
  var result = [];

  if (o) {
    if (Array.isArray(o)) {
      for (const key in o) {
        var item = o[key];
        result.push(RedefineItem(item));
      }
    }
    else {
      result.push(RedefineItem(o));
    }
  }
  return result;
}

function FetchDNLAData(config, requestInfo, callback) {
  var request = require("request-promise-native");

  var requestBody =
    '<?xml version="1.0"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    "<s:Body>" +
    '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
    "<ObjectID>" +
    requestInfo.objectId +
    "</ObjectID>" +
    "<BrowseFlag>BrowseDirectChildren</BrowseFlag>" +
    "<Filter>*</Filter>" +
    "<StartingIndex>" + requestInfo.startingIndex + "</StartingIndex>" +
    "<RequestedCount>" + requestInfo.requestedCount + "</RequestedCount>" +
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
    url: config.dlna.protocol + "://" + config.dlna.domain + "/ctl/ContentDir",
    qs: { wsdl: "" },
    headers: requestHeaders,
    body: requestBody,
    timeout: config.dlna.timeout
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
    items: [],
    error: "TODO : More error details"
  };
}

function ProcessDNLAData(data)
{  
  var containers = RestructureEntities(data["container"]);
  var items = RestructureEntities(data["item"]);
  var resultItems = containers.concat(items);

  var result = {    
    items: resultItems
  };
  return result;
}

module.exports = function (app, config) {

  // TODO : Consider conditionally including these only on DEV environments
  app.get("/raw/:id", (req, res, next) => {
    FetchDNLAData(config, 
      { 
        objectId: req.params["id"], 
        startingIndex: 0, 
        requestedCount: 0 
      }, function (data, error) {
      if(error)
      {
        res.json(CreateErrorResult(error));
        return;
      }
      res.json(data);
    });
  });

  app.get("/raw", (req, res, next) => {
    FetchDNLAData(config, 
      { 
        objectId: "0", 
        startingIndex: 0, 
        requestedCount: 0 
      }, function (data, error) {
      if(error)
      {
        res.json(CreateErrorResult(error));
        return;
      }
      res.json(data);
    });
  });


  app.get("/browse/:id", (req, res, next) => {
    FetchDNLAData(config, 
      { 
        objectId: req.params["id"], 
        startingIndex: 0, 
        requestedCount: 0 
      }, function (data, error) {
      if(error)
      {
        res.json(CreateErrorResult(error));
        return;
      }
      res.json(ProcessDNLAData(data));
    });
  });

  app.get("/browse", (req, res, next) => {
    FetchDNLAData(config, 
      { 
        objectId: "0", 
        startingIndex: 0, 
        requestedCount: 0 
      }, function (data, error) {
      if(error)
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

    FetchDNLAData(config, 
      { 
        objectId: parentId, 
        startingIndex: 0, 
        requestedCount: 0 
      }, function (dnlaData, error) {
      
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
