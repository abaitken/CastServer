
function CreateErrorResult(body, error) {
  return {
    items: [],
    error: error.message
  };
}

let ProcessDNLAData = require('./transform-dlna-data.js').ProcessDNLAData;
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
