const view = require("./nowplaying.html");

var PLAYBACK_STATES = {
    STOPPED: 0,
    PAUSED: 1,
    PLAYING: 2
};

module.exports = function (ko, $) {
    return {
        viewModel: function (root) {
            var self = this;
            self.PLAYBACK_STATES = PLAYBACK_STATES;

            self.trackTimePassed = ko.observable(0);
            self.trackTimeRemaining = ko.observable(0);
            self.trackProgress = ko.observable('50%');
            self.volume = ko.observable({
                level: 50,
                muted: false
            });
            self.playbackState = ko.observable(PLAYBACK_STATES.PAUSED);
            self.currentPlayingMedia = ko.observable({
                artist: "Artist",
                album: "Album",
                title: "Track title goes here",
                trackNumber: 42
            });

            self.backward = function () {
                root._serviceRequest('cast', ['previous'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });
            };

            self.rewind = function () {
                root._serviceRequest('cast', ['rewind'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.play = function () {
                root._serviceRequest('cast', ['play'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.pause = function () {
                root._serviceRequest('cast', ['pause'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.forward = function () {
                root._serviceRequest('cast', ['next'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.seekahead = function () {
                root._serviceRequest('cast', ['seekahead'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.shuffle = function () {
                root._serviceRequest('cast', ['shuffle'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.repeat = function () {
                root._serviceRequest('cast', ['repeat'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.mute = function () {
                root._serviceRequest('cast', ['mute'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.unmute = function () {
                root._serviceRequest('cast', ['unmute'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.stop = function () {
                root._serviceRequest('cast', ['stop'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });

            };

            self.updateVolume = function (newValue) {
                root._serviceRequest('cast', ['volume', newValue])
                    .done(function (data) {
                        // TODO : No action
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });
            };
            
            self.updateVolumeSubscription = false;

            self.getStatus = function () {
                root._serviceRequest('cast', ['status'])
                    .done(function (data) {
                        if(self.updateVolumeSubscription)
                            self.updateVolumeSubscription.dispose();
                        self.volume(data['volume']['level'] * 100);
                        self.updateVolumeSubscription = self.volume.subscribe(function(newValue) { self.updateVolume(newValue); })
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });
            };

            self.onRoutedEvent = function (eventName, args) {

                if (eventName !== 'socketmessage')
                    return;

                var data = args;

                if (data['category'] !== 'nowplaying')
                    return;

                if (!data['action']) {
                    console.log("No action for nowplaying category");
                    return;
                }

                switch (data['action']) {
                    default:
                        console.log("Unexpected action: " + data['action']);
                        break;
                }
            };


            root.eventRouter.subscribe(self.onRoutedEvent);
            self.getStatus();
        },
        template: view
    };
};