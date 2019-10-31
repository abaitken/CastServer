function GetChromecastStatus(host, callback) {
  var Client = require("castv2").Client;

  var client = new Client();
  client.connect(host, function() {
    // create various namespace handlers
    var connection = client.createChannel(
      "sender-0",
      "receiver-0",
      "urn:x-cast:com.google.cast.tp.connection",
      "JSON"
    );
    // var heartbeat = client.createChannel(
    //   "sender-0",
    //   "receiver-0",
    //   "urn:x-cast:com.google.cast.tp.heartbeat",
    //   "JSON"
    // );
    var receiver = client.createChannel(
      "sender-0",
      "receiver-0",
      "urn:x-cast:com.google.cast.receiver",
      "JSON"
    );

    // establish virtual connection to the receiver
    connection.send({ type: "CONNECT" });

    receiver.send({ type: "GET_STATUS", requestId: 1 });

    // display receiver status updates
    receiver.on("message", function(data, broadcast) {
      if ((data.type = "RECEIVER_STATUS")) {
        callback(data);
      }
    });
  });
}

module.exports = function(app, notifier, config) {
  app.get("/cast/status", (req, res, next) => {
    // TODO : Resolve this hard coded device!
    var host = config.devices[0]['address'];
    GetChromecastStatus(host, function(data) {
      res.json(data);
    });
  });

  app.get("/cast/pause", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "pause" });
  });

  app.get("/cast/play", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "play" });
  });

  app.get("/cast/stop", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "stop" });
  });

  app.get("/cast/disconnect", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "disconnect" });
  });

  app.get("/cast/connect", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "connect" });
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
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "mute" });
  });

  app.get("/cast/unmute", (req, res, next) => {
    // TODO : Implement
    res.json("OK");
    notifier.NotifyClients({ "category": "cast", "action": "unmute" });
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
    
};
