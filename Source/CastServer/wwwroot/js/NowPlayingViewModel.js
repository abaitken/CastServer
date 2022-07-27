
const PLAYBACK_STATES = {
    STOPPED: 0,
    PAUSED: 1,
    PLAYING: 2
};

function ViewModel(root) {
    let self = this;
    self.PLAYBACK_STATES = PLAYBACK_STATES;

    self.trackTimePassed = ko.observable(0);
    self.trackTimeRemaining = ko.observable(0);
    self.trackProgress = ko.observable('50%');
    self.volumeLevel = ko.observable(50);
    self.muted = ko.observable(false);

    self.playbackState = ko.observable(PLAYBACK_STATES.PAUSED);
    self.currentPlayingMedia = ko.observable({
        artist: "Artist",
        album: "Album",
        title: "Track title goes here",
        trackNumber: 42
    });

    self.backward = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Previous',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.rewind = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Rewind',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.play = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Play',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.pause = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Pause',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.forward = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Next',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.seekahead = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'SeekAhead',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.shuffle = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Shuffle',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.repeat = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Repeat',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.mute = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Mute',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.unmute = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Unmute',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.stop = function () {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/' + 'Stop',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to update
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.updateVolume = function (newValue) {
        $.ajax({
            type: 'PUT',
            url: 'api/Cast/Volume/' + newValue,
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // TODO : No action
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.updateVolumeSubscription = false;
    self.updateVolumeSuspended = false;

    self.getStatus = function () {
        $.ajax({
            type: 'GET',
            url: 'api/Cast/Status',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                if (self.updateVolumeSubscription)
                    self.updateVolumeSubscription.dispose();
                self.volumeLevel(data['volume']['level'] * 100);
                self.muted(data['volume']['muted'] === 1 ? true : false);
                self.updateVolumeSubscription = self.volumeLevel.subscribe(function (newValue) {
                    if (!self.updateVolumeSuspended)
                        self.updateVolume(newValue);
                })
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.onRoutedEvent = function (eventName, args) {

        if (eventName !== 'socketmessage')
            return;

        var data = args;

        if (data['category'] !== 'cast')
            return;

        if (!data['action']) {
            console.log("No action for nowplaying category");
            return;
        }

        switch (data['action']) {
            case 'repeat':
                var repeatButton = $('#repeatButton');
                if (repeatButton.hasclass('button-state-toggled'))
                    repeatButton.removeClass('button-state-toggled');
                else
                    repeatButton.addClass('button-state-toggled');
                break;
            case 'shuffle':
                var shuffleButton = $('#shuffleButton');
                if (shuffleButton.hasclass('button-state-toggled'))
                    shuffleButton.removeClass('button-state-toggled');
                else
                    shuffleButton.addClass('button-state-toggled');
                break;
            case 'seekahead':
                // TODO : Implement
                break;
            case 'rewind':
                // TODO : Implement
                break;
            case 'previous':
                // TODO : Implement
                break;
            case 'next':
                // TODO : Implement
                break;
            case 'stop':
                self.playbackState(PLAYBACK_STATES.STOPPED);
                break;
            case 'play':
                self.playbackState(PLAYBACK_STATES.PLAYING);
                break;
            case 'pause':
                self.playbackState(PLAYBACK_STATES.PAUSED);
                break;
            case 'unmute':
                self.muted(false);
                break;
            case 'mute':
                self.muted(true);
                break;
            case 'volume':
                if (self.volumeLevel() != data['value']) {
                    self.updateVolumeSuspended = true;
                    self.volumeLevel(data['value']);
                    self.updateVolumeSuspended = false;
                }
                break;
            default:
                console.log("Unexpected action: " + data['action']);
                break;
        }
    };

    self.getStatus();
}
ko.applyBindings(new ViewModel());


/*
function ViewModel() {
var self = this;

self.eventRouter = new EventRouter();
self.errors = new ErrorHandling();

self._serviceRequest = function (action, urlArgs) {
var url = "/" + action;
if (Array.isArray(urlArgs)) {
  for (let index = 0; index < urlArgs.length; index++) {
    const item = urlArgs[index];

    url = url + "/" + item;
  }
}
else if (urlArgs) {
  url = url + "/" + urlArgs;
}

return $.ajax({
  type: "GET",
  url: url,
  dataType: "json",
  mimeType: "application/json"
});
}

self.indexOfArrayEx = function (array, propertyName, value) {
for (let index = 0; index < array.length; index++) {
  const element = array[index];
  if (element[propertyName] === value)
    return index;
}

return -1;
};


self.socketConnect = function () {
var socketUrl = '';
if (window.location.protocol === "https:") {
  socketUrl = "wss:";
} else {
  socketUrl = "ws:";
}
socketUrl += "//" + window.location.host;
socketUrl += window.location.pathname;
if (socketUrl.lastIndexOf('/') != socketUrl.length - 1)
  socketUrl += "/";
socketUrl += "ws";

if (self.webSocket) {
  self.webSocket.close();
}

// TODO : PING/PONG to prevent timeouts?
self.webSocket = new WebSocket(socketUrl);

self.webSocket.onclose = function (event) {
  setTimeout(function () { self.socketConnect(); }, 1000);
};

self.webSocket.onmessage = async function (event) {
  var data = JSON.parse(event.data);

  if (!data['category']) {
    console.log("Unexpected socket data: " + event.data);
    return;
  }

  self.eventRouter.raise('socketmessage', data);
};

};

self.Init = function () {
ko.applyBindings(self);
self.socketConnect();
};
}*/