import $ from 'jquery';
import ko from 'knockout';
import 'bootstrap';
import 'popper.js';
import '@fortawesome/fontawesome-free/js/all.js'
import '@fortawesome/fontawesome-free/css/all.css'
import './custom.scss';

const browse = require("./components/browse")(ko, $);
ko.components.register("browse", browse);

const playlist = require("./components/playlist")(ko, $);
ko.components.register("playlist", playlist);

const nowplaying = require("./components/nowplaying")(ko, $);
ko.components.register("nowplaying", nowplaying);

function ViewModel() {
  var self = this;

  self.messages = ko.observable("Fetching...");
  self.playlistViewModel = playlist.viewModel;
  self.eventRouter = function () {
    this.subscribers = [];
    this.subscribe = function (callback) {
      this.subscribers.push(callback);
    };
    this.raise = function (eventName, args) {
      for (let index = 0; index < this.subscribers.length; index++) {
        const subscriber = this.subscribers[index];
        subscriber(eventName, args);
      }
    };
  };

  /* COMMON */
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


  /* Websockets */
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

      switch (data['category']) {
        case 'playlist':
          if (!data['action']) {
            console.log("No action for playlist category");
            return;
          }

          switch (data['action']) {
            case 'add':
              await self._serviceRequest('info', data['id'])
                .done(function (data) {
                  playlist.viewModel.playlist.push(data);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                  self.messages(errorThrown);
                  $("#messages").attr("class", "alert alert-danger");
                  // TODO : Text not displaying correctly
                  $("#track-info").html("Error: " + errorThrown);
                });
              break;
            case 'remove':
              playlist.viewModel._removePlaylistItemImpl(data['id']);
              break;
            case 'clear':
              playlist.viewModel.playlist([]);
              break;
            case 'move':
              var originalIndex = self.indexOfArrayEx(playlist.viewModel.playlist(), 'id', data['id']);

              if (originalIndex !== -1) {
                var item = playlist.viewModel.playlist()[originalIndex];
                var newIndex = data['index'];
                playlist.viewModel.playlist.splice(originalIndex, 1);
                playlist.viewModel.playlist.splice(newIndex, 0, item);
              }

              break;
            default:
              console.log("Unexpected action: " + data['action']);
              break;
          }
          break;
        default:
          console.log("Unexpected category: " + data['category']);
          break;
      }
    };

  };

  /* Page/Navigation */
  self._focusContainer = function (containerPrefix) {
    const selectedClass = 'active';
    $('.viewCommand').removeClass(selectedClass);
    $('.viewContainer').hide();

    $('#' + containerPrefix + 'Command').addClass(selectedClass);
    $('#' + containerPrefix + 'Container').show();
  };

  self.browseCommand = function () {
    self._focusContainer('browse');
  };

  self.playlistCommand = function () {
    self._focusContainer('playlist');
  };

  self.nowPlayingCommand = function () {
    self._focusContainer('nowPlaying');
  };

  /* INIT */
  self.Init = function () {
    ko.applyBindings(self);

    self.browseCommand();
    self.socketConnect();
  };
}

var vm = new ViewModel();
vm.Init();
