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


function CreateErrorResult(body, error) {
  return {
    items: [],
    error: error.message
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

let DLNAClient = require('./dlna.js').Client;

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
          res.json(CreateErrorResult(data, error));
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
          res.json(CreateErrorResult(data, error));
          return;
        }
        res.json(ProcessDNLAData(data));
      });
  });

  app.get("/search/:id/:criteria/:page", (req, res, next) => {
    dlnaClient.Search(
      {
        objectId: req.params["id"],
        searchCriteria: 'dc:title = "' + req.params['criteria'] + '"',
        startingIndex: (req.params["page"] ? req.params["page"] : 0) * ITEM_PAGE_COUNT,
        requestedCount: ITEM_PAGE_COUNT,
        sortCriteria: '+upnp:class,+dc:title',
        timeout: config.dlna.timeout
      }, function (data, error) {
        if (error) {
          res.json(CreateErrorResult(data, error));
          return;
        }
        res.json(ProcessDNLAData(data));
      });

  });

  app.get("/info/:id", (req, res, next) => {
    dlnaClient.Info(
      {
        objectId: req.params["id"],
        timeout: config.dlna.timeout
      }, function (data, error) {
        if (error) {
          res.json(CreateErrorResult(data, error));
          return;
        }
        res.json(ProcessDNLAData(data).items[0]);
      });
  });
};
