var g_playlist = [];

module.exports = function(app, config) {
  app.get("/playlist/list", (req, res, next) => {
    res.json(g_playlist);
  });

  app.get("/playlist/add", (req, res, next) => {
    res.json({"result": "NotImplemented"});
  });

  app.get("/playlist/remove", (req, res, next) => {
    res.json({"result": "NotImplemented"});
  });

  app.get("/playlist/reorder", (req, res, next) => {
    res.json({"result": "NotImplemented"});
  });

  app.get("/playlist/clear", (req, res, next) => {
    res.json({"result": "NotImplemented"});
  });
    
};
