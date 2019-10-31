const view = require("./nowplaying.html");

module.exports = function (ko, $) {
    return {
        viewModel: function (root) {
            var self = this;
            self.trackTimePassed = ko.observable(0);
            self.trackTimeRemaining = ko.observable(0);
            self.trackProgress = ko.observable('50%');
            self.volume = ko.observable(50);

            self.backward = function(){

            };

            self.rewind = function(){

            };

            self.play = function(){

            };

            self.pause = function(){

            };

            self.forward = function(){

            };

            self.seekahead = function(){

            };

            self.shuffle = function(){

            };

            self.repeat = function(){

            };

            self.mute = function(){

            };

            self.unmute = function(){

            };

            self.stop = function(){

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