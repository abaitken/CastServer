module.exports = {
    Notifier: class Notifier {
        constructor(server) {

            this.WebSockets = require('ws');
            this.socketServer = new this.WebSockets.Server({ server });
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