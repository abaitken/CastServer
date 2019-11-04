var http = require('http');
var config = require('./config.json');

var express = require("express");
const app = express();

app.use(express.static('static'));
const server = http.createServer(app);

var notifications = require('./notifications.js');
var notifier = new notifications.Notifier(server);

require("./discover")(app, config);
require("./browse")(app, config);
require("./cast")(app, notifier, config);
require("./playlist")(app, notifier, config);

server.listen(config.server.listenPort, () => {
  console.log("Server running on port " + config.server.listenPort);
});

if (config.server.mode === 'console') {
  const readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', function (str, key) {
    if (key && key.name == 'q') process.exit();
  });

  console.log("Press 'q' to exit");
}