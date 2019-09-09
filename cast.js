module.exports = function(app) {
    app.get("/status", (req, res, next) => {
     
var Client = require('castv2').Client;
var host = '192.168.1.4';

var client = new Client();
  client.connect(host, function() {
    // create various namespace handlers
    var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
    var heartbeat  = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
    var receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');
 
    // establish virtual connection to the receiver
    connection.send({ type: 'CONNECT' });
    
    receiver.send({ type: 'GET_STATUS', requestId: 1 });
 
    // display receiver status updates
    receiver.on('message', function(data, broadcast) {
      if(data.type = 'RECEIVER_STATUS') {
     res.json(data);
      }
    });
  });
  
    });
};

