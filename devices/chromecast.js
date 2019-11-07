const EventEmitter = require('events').EventEmitter;
const Client = require("castv2").Client;

const APP_IDS = {
    DEFAULT_MEDIA_RECEIVER: "CC1AD845"
};

class ChannelBase extends EventEmitter {
    constructor(client, sender, receiver, urn) {
        super();
        this._channel = client.createChannel(sender, receiver, urn, 'JSON');

        var self = this;

        function onclose() {
            self._channel.removeListener('message', onmessage);
            self.emit('close');
        }

        this._channel.on('message', function (data, broadcast) {
            if (broadcast)
                self.emit('broadcast', data);
            else
                self.emit('message', data);
        });
        this._channel.once('close', onclose);
    }

    send(data, callback) {
        var self = this;

        function onmessage(response, broadcast) {
            console.log(response);
            var result = callback(response, broadcast);
            if (result) {
                self._channel.removeListener('message', onmessage);
            }
        }

        if (callback !== undefined)
        self._channel.on('message', onmessage);
        console.log(data);
        self._channel.send(data);
    }

    close() {
        this._channel.close();
    }
}

class ChannelRequestFiltering extends ChannelBase {
    constructor(client, sender, receiver, urn) {
        super(client, sender, receiver, urn);
        this._requestId = 1;
    }

    send(data, callback) {
        var self = this;
        var requestId = ++this._requestId;
        data.requestId = requestId;

        super.send(data, function (response, broadcast) {
            if (response.requestId === requestId) {
                callback(response, broadcast);
                return true;
            }
            return false;
        });
    }
}

class Connection extends ChannelRequestFiltering {
    constructor(client) {
        super(client, "sender-0", "receiver-0", "urn:x-cast:com.google.cast.tp.connection");
    }
}

class Receiver extends ChannelRequestFiltering {
    constructor(client) {
        super(client, "sender-0", "receiver-0", "urn:x-cast:com.google.cast.receiver");
    }
}

class Media extends ChannelRequestFiltering {
    constructor(client) {
        super(client, "sender-0", "receiver-0", "urn:x-cast:com.google.cast.media");
    }
}

class Heartbeat extends ChannelBase {
    constructor(client) {
        super(client, "sender-0", "receiver-0", "urn:x-cast:com.google.cast.tp.heartbeat");
        var self = this;
        // TODO : Stop heartbeat on close
        setTimeout(self._onheartbeat.bind(self), 5000);
    }

    _onheartbeat() {
        var self = this;
        super.send({ type: 'PING' }, function (data, broadcast) {
            if (/*!self._connected || */data['type'] != "PONG") {
                return true;
            }
            setTimeout(self._onheartbeat.bind(self), 5000, self);
            return true;
        });
    }
}

module.exports = {
    APP_IDS: APP_IDS,
    Chromecast: class Chromecast {
        constructor(host, broadcastCallback) {
            this._host = host;
            this._connected = false;
            this._mediaSession = null;
            this._broadcastCallback = broadcastCallback;
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
                self._connection = new Connection(self._client);

                self._receiver = new Receiver(self._client);
                self._receiver.on('broadcast', function (data) {
                    self._broadcastCallback(data);
                });

                self._media = new Media(self._client);
                self._media.on('broadcast', function (data) {
                    self._broadcastCallback(data);
                });

                self._connection.send({ type: "CONNECT" });
                self._heartbeat = new Heartbeat(self._client);

                callback();
            });
        }

        Close() {
            this._connected = false;
            // TODO : Remove all event subscriptions
            this._connection.send({ type: "CLOSE" });
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
            var self = this;
            this.Connect(function () {
                self._receiver.send({ type: "GET_STATUS" }, callback);
            });
        }

        MediaStatus(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.send({ type: "GET_STATUS", mediaSessionId: sessionId }, callback);
            });
        }

        SetVolume(level, callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiver.send({
                    type: "SET_VOLUME",
                    mediaSessionId: sessionId,
                    volume: {
                        level: level / 100
                    }
                }, callback);
            });
        }

        Launch(appId, callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.send({
                    type: "LAUNCH",
                    appId: appId,
                }, function (data, broadcast) {
                    callback(data, broadcast);
                });
            });
        }

        Load(media, callback) {
            var self = this;
            this.Connect(function () {
                self._media.send({
                    type: "LOAD",
                    media: media,
                }, function (data, broadcast) {
                    callback(data, broadcast);
                });
            });
        }

        Pause(callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiver.send({ type: "PAUSE", mediaSessionId: sessionId }, callback);
            });
        }

        Play(callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiver.send({ type: "PLAY", mediaSessionId: sessionId }, callback);
            });
        }

        Stop(callback) {
            var self = this;
            self._getMediaSession(function (sessionId) {
                self._receiver.send({ type: "STOP", mediaSessionId: sessionId }, callback);
            });
        }

        Mute(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.send({
                    type: "SET_VOLUME", volume: {
                        muted: true
                    }
                }, callback);
            });
        }

        Unmute(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.send({
                    type: "SET_VOLUME", volume: {
                        muted: false
                    }
                }, callback);
            });
        }
    }
};