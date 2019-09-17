var express = require("express");
var app = express();

require("./browse")(app);
require("./cast")(app);
require("./playlist")(app);

app.use(express.static('static'));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

