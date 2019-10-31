const view = require("./nowplaying.html");

module.exports = function (ko, $) {
    return {
        viewModel: function (root) {
            var self = this;
            self.trackTimePassed = ko.observable(0);
            self.trackTimeRemaining = ko.observable(0);
            self.trackProgress = ko.observable('50%');
            self.volume = ko.observable(50);

            self.backward = function () {
                root._serviceRequest('cast', ['previous'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });
            };

            self.rewind = function () {
                root._serviceRequest('cast', ['rewind'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.play = function () {
                root._serviceRequest('cast', ['play'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.pause = function () {
                root._serviceRequest('cast', ['pause'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.forward = function () {
                root._serviceRequest('cast', ['next'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.seekahead = function () {
                root._serviceRequest('cast', ['seekahead'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.shuffle = function () {
                root._serviceRequest('cast', ['shuffle'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.repeat = function () {
                root._serviceRequest('cast', ['repeat'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.mute = function () {
                root._serviceRequest('cast', ['mute'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.unmute = function () {
                root._serviceRequest('cast', ['unmute'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });

            };

            self.stop = function () {
                root._serviceRequest('cast', ['stop'])
                    .done(function (data) {
                        // NOTE : Socket message will come back to update
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
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
        },
        template: view
    };
};