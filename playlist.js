class Playlist {
  constructor() {
    this.Items = [];
  }

  Add(item) {
    this.Items.push(item);
  }

  IndexOfKey(key) {
    for (let index = 0; index < this.Items.length; index++) {
      const item = this.Items[index];
      if (item['id'] === key)
        return index;
    }

    return -1;
  }

  RemoveIndex(index) {
    if (index === -1)
      return false;
    console.log('item removed');
    this.Items.splice(index, 1);
    return true;
  }

  RemoveKey(key) {
    var index = this.IndexOfKey(key);
    if (index !== -1)
      return this.RemoveIndex(index);

    return false;
  }

  Remove(item) {
    var index = this.Items.indexOf(item);
    if (index === -1)
      return false;
    this.RemoveIndex(index);
    return true;
  }

  MoveIndex(oldIndex, newIndex) {
    if (oldIndex === -1 || newIndex === -1)
      return false;
    var item = this.Items[oldIndex];
    this.Items.splice(oldIndex, 1);
    this.Items.splice(newIndex, 0, item);
    console.log('item moved');
    return true;
  }

  MoveKey(key, index) {
    var oldIndex = this.IndexOfKey(key);
    if (oldIndex !== -1)
      return this.MoveIndex(oldIndex, index);

    return false;
  }

  Move(item, index) {
    var oldIndex = this.Items.indexOf(item);
    if (oldIndex === -1)
      return false;

    return this.MoveIndex(oldIndex, index);
  }

  Clear() {
    this.Items = [];
    console.log('items cleared');
  }
}

var g_playlist = new Playlist();
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
    res.json(g_playlist.Items);
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
        g_playlist.Add(ProcessDNLAData(data).items[0]);
        res.json("OK");
        notifier.NotifyClients({ "category": "playlist", "action": "add", "id": req.params["id"] });
      });

  });

  app.get("/playlist/remove/:id", (req, res, next) => {
    g_playlist.RemoveKey(req.params['id']);
    res.json("OK");
    notifier.NotifyClients({ "category": "playlist", "action": "remove", "id": req.params["id"] });
  });

  app.get("/playlist/move/:id/to/:index", (req, res, next) => {

    var newIndex = req.params['index'];
    var itemId = req.params["id"];

    g_playlist.MoveKey(itemId, newIndex);
    res.json("OK");
    notifier.NotifyClients({ "category": "playlist", "action": "move", "id": itemId, "index": newIndex });
  });

  app.get("/playlist/clear", (req, res, next) => {
    g_playlist.Clear();
    res.json("OK");
    notifier.NotifyClients({ "category": "playlist", "action": "clear" });
  });

};
