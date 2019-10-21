var config = require('./config.json');

var express = require("express");
var app = express();

require("./browse")(app, config);
require("./cast")(app, config);
require("./playlist")(app, config);

app.use(express.static('static'));

var listenPort = 3000;

app.listen(listenPort, () => {
  console.log("Server running on port " + listenPort);
});

// TODO : Conditionally execute this code when running as a service
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (str, key) {
  if (key && key.name == 'q') process.exit();
});

console.log("Press 'q' to exit");