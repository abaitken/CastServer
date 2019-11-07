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
    constructor(client, sender, reciever) {
        super(client, sender, reciever, "urn:x-cast:com.google.cast.tp.connection");
    }

    connect() {
        super.send({ type: "CONNECT" });
    }

    close() {
        super.send({ type: "CLOSE" });
        super.close();
    }
}

class Receiver extends ChannelRequestFiltering {
    constructor(client) {
        super(client, "sender-0", "receiver-0", "urn:x-cast:com.google.cast.receiver");
    }

    status(callback) {
        super.send({ type: "GET_STATUS" }, callback);
    }

    setVolume(level, callback) {
        super.send({
            type: "SET_VOLUME",
            volume: {
                level: level / 100
            }
        }, callback);
    }

    launch(appId, callback) {
        super.send({
            type: "LAUNCH",
            appId: appId,
        }, callback);
    }

    muted(value, callback) {
        super.send({
            type: "SET_VOLUME", volume: {
                muted: value
            }
        }, callback);
    }

    stop(callback) {
        super.send({ type: "STOP" }, callback);
    }

    play(callback) {
        super.send({ type: "PLAY" }, callback);
    }

    pause(callback) {
        super.send({ type: "PAUSE" }, callback);
    }
}

class Media extends ChannelRequestFiltering {
    constructor(client, sender, reciever) {
        super(client, sender, reciever, "urn:x-cast:com.google.cast.media");
    }

    status(callback) {
        super.send({ type: "GET_STATUS" }, callback);
    }

    load(media, callback) {
        super.send({
            type: "LOAD",

            autoplay: true,
            currentTime: 0,
            activeTrackIds: [],
            repeatMode: "REPEAT_OFF",
            media: media,
        }, callback);
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
            this._media = null;
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
                self._connection = new Connection(self._client, "sender-0", "receiver-0");

                self._receiver = new Receiver(self._client);
                self._receiver.on('broadcast', function (data) {
                    self._broadcastCallback(data);
                });

                self._connection.connect();
                self._heartbeat = new Heartbeat(self._client);

                callback();
            });
        }

        Close() {
            this._connected = false;
            // TODO : Remove all event subscriptions
            this._connection.close();
        }

        _getMediaSession(callback) {
            var self = this;
            if (self._media !== null) {
                callback(self._media);
                return;
            }

            self.Status(function (data, broadcast) {
                var transportId = data['status']['applications']['0']['transportId'];
                var sender = 'client-' + Math.floor(Math.random() * 10e5);

                self._mediaConnection = new Connection(self._client, sender, transportId);
                self._mediaConnection.connect();

                self._media = new Media(self._client, sender, transportId);
                self._media.on('broadcast', function (data) {
                    self._broadcastCallback(data);
                });

                callback(self._media);
            });
        }

        Status(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.status(callback);
            });
        }

        MediaStatus(callback) {
            this._getMediaSession(function (mediaChannel) {
                mediaChannel.status(callback);
            });
        }

        SetVolume(level, callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.setVolume(level, callback);
            });
        }

        Launch(appId, callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.launch(appId, callback);
            });
        }

        Load(media, callback) {
            this._getMediaSession(function (mediaChannel) {
                mediaChannel.load(media, callback);
            });
        }

        Pause(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.pause(callback);
            });
        }

        Play(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.play(callback);
            });
        }

        Stop(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.stop(callback);
            });
        }

        Mute(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.muted(true, callback);
            });
        }

        Unmute(callback) {
            var self = this;
            this.Connect(function () {
                self._receiver.muted(false, callback);
            });
        }
    }
};