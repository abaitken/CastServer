const Client = require("castv2").Client;

const APP_IDS = {
    DEFAULT_MEDIA_RECEIVER: "CC1AD845"
};

module.exports = {
    Chromecast: class Chromecast {
        constructor(host) {
            this._host = host;
            this._connected = false;
            this._mediaSession = null;
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

                self._media = self._client.createChannel(
                    "sender-0",
                    "receiver-0",
                    "urn:x-cast:com.google.cast.media",
                    "JSON"
                );

                self._heartbeat = self._client.createChannel(
                    "sender-0",
                    "receiver-0",
                    "urn:x-cast:com.google.cast.tp.heartbeat",
                    "JSON"
                );
                setTimeout(self._heartbeatSend.bind(self), 5000, self);

                self._connection.send({ type: "CONNECT" });
                callback();
            });
        }

        Close() {
            this._connected = false;
            // TODO : Remove all event subscriptions
            this._connection.send({ type: "CLOSE" });
        }

        _send(channelSelector, message, callback) {
            var reponseHandler = function (data, broadcast) {
                console.log(data);
                console.log(broadcast);
                if (!message['requestId'] || data['requestId'] == message['requestId']) {
                    channelSelector().removeListener('message', reponseHandler);
                    callback(data, broadcast);
                }
            };

            this.Connect(function () {
                channelSelector().on('message', reponseHandler);
                console.log(message);
                channelSelector().send(message);
            });

        }

        _heartbeatSend() {
            var self = this;
            if (!self._connected) {
                return;
            }

            self._send(function () { return self._heartbeat; }, { type: 'PING' }, function (data, broadcast) {
                if (!self._connected || data['type'] != "PONG") {
                    return;
                }
                setTimeout(self._heartbeatSend.bind(self), 5000, self);
            });
        }

        _receiverSend(message, callback) {
            var self = this;
            this._send(function () { return self._receiver; }, message, callback);
        }

        _mediaSend(message, callback) {
            var self = this;
            this._send(function () { return self._media; }, message, callback);
        }

        _getMediaSession(callback) {
            var self = this;
            if (self._mediaSession !== false) {
                callback(self._mediaSession);
                return;
            }

            self.Status(function (data, broadcast) {
                self._mediaSession = 0; //data['status']['applications']['0']['sessionId'];
                callback(self._mediaSession);
            });
        }

        Status(callback) {
            this._receiverSend({ type: "GET_STATUS", requestId: 1 }, callback);
        }

        MediaStatus(callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiverSend({ type: "GET_STATUS", requestId: 1, mediaSessionId: sessionId }, callback);
            });
        }

        SetVolume(level, callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiverSend({
                    type: "VOLUME",
                    requestId: 1,
                    mediaSessionId: sessionId,
                    volume: {
                        level: level / 100
                    }
                }, callback);
            });
        }

        Pause(callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiverSend({ type: "PAUSE", requestId: 1, mediaSessionId: sessionId }, callback);
            });
        }

        Play(callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiverSend({ type: "PLAY", requestId: 1, mediaSessionId: sessionId }, callback);
            });
        }

        Stop(callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiverSend({ type: "STOP", requestId: 1, mediaSessionId: sessionId }, callback);
            });
        }

        Mute(callback) {
            this._receiverSend({
                type: "VOLUME", requestId: 1, volume: {
                    muted: true
                }
            }, callback);
        }

        Unmute(callback) {
            this._receiverSend({
                type: "VOLUME", requestId: 1, volume: {
                    muted: false
                }
            }, callback);
        }
    }
};