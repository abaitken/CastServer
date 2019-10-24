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

function RedefineMusic(item) {
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

function RedefineUnknown(item) {
  return {
    id: item['$']['id'],
    parentID: item['$']['parentID'],
    title: item['dc:title'],
    class: item['upnp:class'],
  };
};

function RedefineItem(item) {
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

var g_request = require("request-promise-native");
var g_decode = require("unescape");
var g_xml2js = require("xml2js");
var g_parser = new g_xml2js.Parser({ explicitArray: false });

class DLNAClient {
  constructor(protocol, domain) {
    this._protocol = protocol;
    this._domain = domain;
  }

  _request(requestBody, soapaction, timeout, callback) {
    var requestHeaders = {
      "cache-control": "no-cache",
      soapaction: soapaction,
      "content-type": "text/xml;charset=UTF-8"
    };

    var requestOptions = {
      method: "POST",
      url: this._protocol + "://" + this._domain + "/ctl/ContentDir",
      qs: { wsdl: "" },
      headers: requestHeaders,
      body: requestBody,
      timeout: timeout
    };

    g_request(requestOptions)
      .then(function (body) {
        callback(body, null);
      })
      .catch(function (error) {
        callback(null, error);
      });
  }

  SearchCapabilities(requestInfo, callback) {
    var requestBody =
      '<?xml version="1.0"?>' +
      '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
      "<s:Body>" +
      '<u:GetSearchCapabilities xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
      "</u:GetSearchCapabilities>" +
      "</s:Body>" +
      "</s:Envelope>";

    this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSearchCapabilities", requestInfo.timeout,
      function (body, error) {
        if (error !== null) {
          callback(null, error);
          return;
        }

        console.log(body);
        const getResultRegex = /<SearchCaps>(?<DATA>[^]+)<\/SearchCaps>/;
        var match = getResultRegex.exec(body);
        var data = match["groups"]["DATA"];

        callback(data, null);
      });
  }

  SortCapabilities(requestInfo, callback) {
    var requestBody =
      '<?xml version="1.0"?>' +
      '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
      "<s:Body>" +
      '<u:GetSortCapabilities xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
      "</u:GetSortCapabilities>" +
      "</s:Body>" +
      "</s:Envelope>";

    this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSortCapabilities", requestInfo.timeout,
      function (body, error) {
        if (error !== null) {
          callback(null, error);
          return;
        }

        console.log(body);
        const getResultRegex = /<SortCaps>(?<DATA>[^]+)<\/SortCaps>/;
        var match = getResultRegex.exec(body);
        var data = match["groups"]["DATA"];

        callback(data, null);
      });
  }

  SystemUpdateID(requestInfo, callback) {
    var requestBody =
      '<?xml version="1.0"?>' +
      '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
      "<s:Body>" +
      '<u:GetSystemUpdateID xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
      "</u:GetSystemUpdateID>" +
      "</s:Body>" +
      "</s:Envelope>";

    this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSystemUpdateID", requestInfo.timeout,
      function (body, error) {
        if (error !== null) {
          callback(null, error);
          return;
        }

        console.log(body);
        const getResultRegex = /<SortCaps>(?<DATA>[^]+)<\/SortCaps>/;
        var match = getResultRegex.exec(body);
        var data = match["groups"]["DATA"];

        callback(data, null);
      });
  }

  Browse(requestInfo, callback) {
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
      "<SortCriteria>" + requestInfo.sortCriteria + "</SortCriteria>" +
      "</u:Browse>" +
      "</s:Body>" +
      "</s:Envelope>";

    this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Browse", requestInfo.timeout,
      function (body, error) {
        if (error !== null) {
          callback(null, error);
          return;
        }
        const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
        var match = getResultRegex.exec(body);
        var data = g_decode(match["groups"]["DATA"]);

        let jsonData;
        g_parser.parseString(data, function (err, parseResult) {
          jsonData = parseResult["DIDL-Lite"];
        });

        callback(jsonData, null);
      });
  }

  Search(requestInfo, callback) {
    var requestBody =
    '<?xml version="1.0"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    "<s:Body>" +
    //"<ObjectID>" + requestInfo.objectId + "</ObjectID>" +
    //"<BrowseFlag>BrowseDirectChildren</BrowseFlag>" +
    "<Filter>*</Filter>" +
    "<StartingIndex>" + requestInfo.startingIndex + "</StartingIndex>" +
    "<RequestedCount>" + requestInfo.requestedCount + "</RequestedCount>" +
    "<SortCriteria>" + requestInfo.sortCriteria + "</SortCriteria>" +
    "<SearchCriteria>" + requestInfo.searchCriteria + "</SearchCriteria>" +
    "</s:Body>" +
    "</s:Envelope>";

    this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Search", requestInfo.timeout,
      function (body, error) {
        if (error !== null) {
          callback(null, error);
          return;
        }
        const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
        var match = getResultRegex.exec(body);
        var data = g_decode(match["groups"]["DATA"]);

        let jsonData;
        g_parser.parseString(data, function (err, parseResult) {
          jsonData = parseResult["DIDL-Lite"];
        });

        callback(jsonData, null);
      });
  }

}

function CreateErrorResult(error) {
  console.log(error);
  return {
    items: [],
    error: "TODO : More error details"
  };
}

function ProcessDNLAData(data) {
  var containers = RestructureEntities(data["container"]);
  var items = RestructureEntities(data["item"]);
  var resultItems = containers.concat(items);

  var result = {
    items: resultItems
  };
  return result;
}

module.exports = function (app, config) {

  var ITEM_PAGE_COUNT = 25;
  var dlnaClient = new DLNAClient(config.dlna.protocol, config.dlna.domain);

  // TODO : Consider conditionally including this only on DEV environments
  app.get("/SearchCapabilities", (req, res, next) => {
    dlnaClient.SearchCapabilities(
      {
        timeout: config.dlna.timeout
      },
      function (data, error) {
        if (error !== null) {
          res.json(error);
          return;
        }
        res.json(data);
      });
  });

  app.get("/SortCapabilities", (req, res, next) => {
    dlnaClient.SortCapabilities(
      {
        timeout: config.dlna.timeout
      },
      function (data, error) {
        if (error !== null) {
          res.json(error);
          return;
        }
        res.json(data);
      });
  });

  app.get("/SystemUpdateID", (req, res, next) => {
    dlnaClient.SystemUpdateID(
      {
        timeout: config.dlna.timeout
      },
      function (data, error) {
        if (error !== null) {
          res.json(error);
          return;
        }
        res.json(data);
      });
  });

  app.get("/raw/:id/:page", (req, res, next) => {
    dlnaClient.Browse(
      {
        objectId: req.params["id"],
        startingIndex: (req.params["page"] ? req.params["page"] : 0) * ITEM_PAGE_COUNT,
        requestedCount: ITEM_PAGE_COUNT,
        sortCriteria: '+upnp:class,+dc:title',
        timeout: config.dlna.timeout
      }, function (data, error) {
        if (error) {
          res.json(CreateErrorResult(error));
          return;
        }
        res.json(data);
      });
  });

  app.get("/browse/:id/:page", (req, res, next) => {
    dlnaClient.Browse(
      {
        objectId: req.params["id"],
        startingIndex: (req.params["page"] ? req.params["page"] : 0) * ITEM_PAGE_COUNT,
        requestedCount: ITEM_PAGE_COUNT,
        sortCriteria: '+upnp:class,+dc:title',
        timeout: config.dlna.timeout
      }, function (data, error) {
        if (error) {
          res.json(CreateErrorResult(error));
          return;
        }
        res.json(ProcessDNLAData(data));
      });
  });

  app.get("/search/:criteria/:page", (req, res, next) => {
    dlnaClient.Search(
      {
        //objectId: req.params["id"],
        searchCriteria: req.params['criteria'],
        startingIndex: (req.params["page"] ? req.params["page"] : 0) * ITEM_PAGE_COUNT,
        requestedCount: ITEM_PAGE_COUNT,
        sortCriteria: '+upnp:class,+dc:title',
        timeout: config.dlna.timeout
      }, function (data, error) {
        if (error) {
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
        requestedCount: 0,
        sortCriteria: ''
      }, function (dnlaData, error) {

        if (error)// TODO : Is this correct, doesnt seem to work
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
