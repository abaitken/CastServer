var express = require("express");
var app = express();

require('./browse')(app);
require('./cast')(app);

app.listen(3000, () => {
 console.log("Server running on port 3000");
});