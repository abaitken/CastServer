const Client = require("castv2").Client;

const CONSTANT_APP_IDS = {
    DEFAULT_MEDIA_RECEIVER: "CC1AD845"
};

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
                setTimeout(self._heartbeatSend, 5000);

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
                if (data['requestId'] == data.requestId) {
                    // TODO : Check for corresponding requestId
                    channelSelector().removeListener('message', reponseHandler);
                    callback(data, broadcast);
                }
            };

            this.Connect(function () {
                channelSelector().on('message', reponseHandler);
                channelSelector().send(message);
            });

        }

        _heartbeatSend() {
            if (!this._connected) {
                return;
            }

            var self = this;
            this._send(function () { return self._heartbeat; }, { type: 'PING' }, function (data, broadcast) {
                console.log(data);
                console.log(broadcast);
                setTimeout(self._heartbeatSend, 5000);
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

        Status(callback) {
            this._receiverSend({ type: "GET_STATUS", requestId: 1 }, callback);
        }

        MediaStatus(callback) {
            this._mediaSend({ type: "GET_STATUS", requestId: 1 }, callback);
        }

        SetVolume(level, callback) {
            this._receiverSend({
                type: "VOLUME", requestId: 1, volume: {
                    level: level / 100
                }
            }, callback);
        }

        Pause(callback) {
            this._mediaSend({ type: "PAUSE", requestId: 1, mediaSessionId: this.mediaSession }, callback);
        }

        Play(callback) {
            this._mediaSend({ type: "PLAY", requestId: 1, mediaSessionId: this.mediaSession }, callback);
        }

        Stop(callback) {
            this._mediaSend({ type: "STOP", requestId: 1, mediaSessionId: this.mediaSession }, callback);
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