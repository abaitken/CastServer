var g_playlist = [];

let ProcessDNLAData = require('./transform-dlna-data.js').ProcessDNLAData;
let DLNAClient = require('./dlna.js').Client;

function CreateErrorResult(body, error) {
  return {
    items: [],
    error: error.message
  };
}

module.exports = function (app, notifier, config) {
  var dlnaClient = new DLNAClient(config.dlna.protocol, config.dlna.domain);

  app.get("/playlist/list", (req, res, next) => {
    res.json(g_playlist);
  });

  app.get("/playlist/add/:id", (req, res, next) => {

    dlnaClient.Info(
      {
        objectId: req.params["id"],
        timeout: config.dlna.timeout
      }, function (data, error) {
        if (error) {
          res.json(CreateErrorResult(data, error));
          return;
        }
        g_playlist.push(ProcessDNLAData(data).items[0]);
        res.json("OK");
        notifier.NotifyClients({ "category": "playlist", "action": "add", "id": req.params["id"] });
      });

  });

  app.get("/playlist/remove/:id", (req, res, next) => {
    dlnaClient.Info(
      {
        objectId: req.params["id"],
        timeout: config.dlna.timeout
      }, function (data, error) {
        if (error) {
          res.json(CreateErrorResult(data, error));
          return;
        }
        var itemIndex = g_playlist.indexOf(ProcessDNLAData(data).items[0]);
        if (itemIndex !== -1)
          g_playlist.splice(itemIndex, 1);
        res.json("OK");
        notifier.NotifyClients({ "category": "playlist", "action": "remove", "id": req.params["id"] });
      });

  });

  app.get("/playlist/reorder", (req, res, next) => {
    res.json({ "result": "NotImplemented" });
  });

  app.get("/playlist/clear", (req, res, next) => {
    g_playlist = [];
    res.json("OK");
    notifier.NotifyClients({ "category": "playlist", "action": "clear" });
  });

};
