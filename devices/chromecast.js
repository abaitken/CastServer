const Client = require("castv2").Client;

module.exports = {
    Chromecast: class Chromecast {
        constructor(host) {
            this._host = host;
            this._connected = false;
        }

        get IsConnected() {
            return this._connected;
        }

        Connect(callback) {
            var self = this;
            if (self._connected) {
                callback();
                return;
            }

            this._client = new Client();
            this._client.connect(this._host, function () {
                self._connected = true;
                self._connection = self._client.createChannel(
                    "sender-0",
                    "receiver-0",
                    "urn:x-cast:com.google.cast.tp.connection",
                    "JSON"
                );

                self._receiver = self._client.createChannel(
                    "sender-0",
                    "receiver-0",
                    "urn:x-cast:com.google.cast.receiver",
                    "JSON"
                );

                self._connection.send({ type: "CONNECT" });

                //self._receiver.on("message", self._messageRecieved);
                callback();
            });
        }

        Close() {
            this._connected = false;
            // TODO : Remove all event subscriptions
            this._connection.send({ type: "CLOSE" });
        }

        _send(message, callback) {
            var self = this;

            var reponseHandler = function (data, broadcast) {
                // TODO : Check for corresponding requestId
                self._receiver.removeListener('message', reponseHandler);
                callback(data, broadcast);
            };

            this.Connect(function () {
                self._receiver.on('message', reponseHandler);
                self._receiver.send(message);
            });
        }

        Status(callback) {
            this._send({ type: "GET_STATUS", requestId: 1 }, callback);
        }

        SetVolume(level, callback) {
            this._send({
                type: "VOLUME", requestId: 1, volume: {
                    level: level / 100
                }
            }, callback);
        }

        Pause(callback) {
            this._send({ type: "PAUSE", requestId: 1 }, callback);
        }

        Play(callback) {
            this._send({ type: "PLAY", requestId: 1 }, callback);
        }

        Stop(callback) {
            this._send({ type: "STOP", requestId: 1 }, callback);
        }

        Mute(callback) {
            this._send({
                type: "VOLUME", requestId: 1, volume: {
                    muted: 1
                }
            }, callback);
        }

        Unmute(callback) {
            this._send({
                type: "VOLUME", requestId: 1, volume: {
                    muted: 0
                }
            }, callback);
        }
    }
};