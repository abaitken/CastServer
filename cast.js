const Chromecast = require('./devices/chromecast.js').Chromecast;

module.exports = function (app, notifier, config) {
  // TODO : Resolve this hard coded device!
  var host = config.devices[1]['address'];

  app.get("/cast/status", (req, res, next) => {
    var client = new Chromecast(host);
    client.Status(function (data) {
      res.json(data['status']);
      client.Close();
    });
  });

  app.get("/cast/pause", (req, res, next) => {
    var client = new Chromecast(host);
    client.Pause(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "pause" });
    });
  });

  app.get("/cast/play", (req, res, next) => {
    var client = new Chromecast(host);
    client.Play(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "play" });
    });
  });

  app.get("/cast/stop", (req, res, next) => {
    var client = new Chromecast(host);
    client.Stop(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "stop" });
    });
  });

  app.get("/cast/next", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "next" });
  });

  app.get("/cast/previous", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "previous" });
  });

  app.get("/cast/rewind", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "rewind" });
  });

  app.get("/cast/seekahead", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "seekahead" });
  });

  app.get("/cast/mute", (req, res, next) => {
    var client = new Chromecast(host);
    client.Mute(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "mute" });
    });
  });

  app.get("/cast/unmute", (req, res, next) => {
    var client = new Chromecast(host);
    client.Unmute(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "unmute" });
    });
  });

  app.get("/cast/repeat", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "repeat" });
  });

  app.get("/cast/shuffle", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "shuffle" });
  });

  app.get("/cast/volume/:newvalue", (req, res, next) => {
    // TODO : Implement
    // TODO : Resolve this hard coded device!
    var host = config.devices[1]['address'];
    var client = new Chromecast(host);
    client.SetVolume(req.params['newvalue'], function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "volume", "value": req.params['newvalue'] });
    });
  });

};
