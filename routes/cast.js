const Chromecast = require('../devices/chromecast');

module.exports = function (app, notifier, config) {
  // TODO : Resolve this hard coded device!
  var host = config.devices[0]['address'];
  var client = new Chromecast.Chromecast(host, function (data) {
    console.log("broadcast");
    console.log(data);

    if (data['type'] == 'RECEIVER_STATUS') {
      notifier.NotifyClients({ "category": "cast", "action": "volume", "value": (data['status']['volume']['level'] * 100) });
      if (data['status']['volume']['muted'])
        notifier.NotifyClients({ "category": "cast", "action": "mute" });
      else
        notifier.NotifyClients({ "category": "cast", "action": "unmute" });
    }
  });

  app.get("/cast/status", (req, res, next) => {
    client.Status(function (data) {
      res.json(data['status']);
    });
  });

  app.get("/cast/pause", (req, res, next) => {
    client.Pause(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "pause" });
    });
  });

  app.get("/cast/play", (req, res, next) => {
    client.Play(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "play" });
    });
  });

  app.get("/cast/stop", (req, res, next) => {
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
    client.Mute(function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "mute" });
    });
  });

  app.get("/cast/unmute", (req, res, next) => {
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
    client.SetVolume(req.params['newvalue'], function (data) {
      res.json(data);
      notifier.NotifyClients({ "category": "cast", "action": "volume", "value": req.params['newvalue'] });
    });
  });

  app.get("/cast/launch", (req, res, next) => {
    client.Launch(Chromecast.APP_IDS.DEFAULT_MEDIA_RECEIVER, function (data) {
      res.json(data);
    })
  });

  app.get("/cast/load", (req, res, next) => {
    // TODO : Implement
    client.Load({

      autoplay: true,
      currentTime: 0,
      activeTrackIds: [],
      repeatMode: "REPEAT_OFF",

      // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
      contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
      contentType: 'video/mp4',
      streamType: 'BUFFERED', // or LIVE

      // Title and cover displayed while buffering
      metadata: {
        type: 0,
        metadataType: 0,
        title: "Big Buck Bunny",
        images: [
          { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
        ]
      }
    }, function (data) {
      res.json(data);
    });
  });

};
