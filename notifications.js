module.exports = {
    Notifier: class Notifier {
        constructor(server) {

            this.WebSockets = require('ws');
            this.socketServer = new this.WebSockets.Server({ server });

            this.socketServer.on('connection', this._onConnection);
            this.socketServer.on('disconnect', this._onDisconnection);
        }

        _onConnection(ws, request, client) {
            console.log("Client connected");
            console.log(client);
        }

        _onDisconnection(ws, request, client) {
            console.log("Client disconnected");
            console.log(client);
        }

        async NotifyClients(data) {
            var self = this;
            this.socketServer.clients.forEach(function each(client) {
                if (client.readyState === self.WebSockets.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    }
};