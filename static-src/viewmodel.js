import $ from 'jquery';
import ko from 'knockout';
import 'bootstrap';
import 'popper.js';
import '@fortawesome/fontawesome-free/js/all.js'
import '@fortawesome/fontawesome-free/css/all.css'
import './custom.scss';

const browse = require("./components/browse")(ko, $);
ko.components.register("browse", browse);

function ViewModel() {
  var self = this;

  self.messages = ko.observable("Fetching...");
  self.playlist = ko.observableArray();

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

  /* BEGIN PLAYLIST Fns */
  self.addEntityToPlaylist = function (item) {
    self._serviceRequest('playlist', ['add', item['id']])
      .done(function (data) {
        // NOTE : Socket message will come back to indicate that a playlist item was added
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      });
  };

  self.indexOfArrayEx = function (array, propertyName, value) {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element[propertyName] === value)
        return index;
    }

    return -1;
  };

  self._removePlaylistItemImpl = function (id) {
    var itemIndex = self.indexOfArrayEx(self.playlist(), 'id', id);
    if (itemIndex !== -1)
      self.playlist.splice(itemIndex, 1);
  };

  self.removeEntityFromPlaylist = function (item) {

    self._serviceRequest('playlist', ['remove', item['id']])
      .done(function (data) {
        // NOTE : Socket message will come back to indicate that a playlist item was added
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      });

  };

  self.clearPlaylist = function () {
    if (self.playlist().length === 0)
      return;

    if (!confirm("Remove all items from the playlist?"))
      return;
    self._serviceRequest('playlist', 'clear')
      .done(function (data) {
        // NOTE : Socket message will come back to indicate that a playlist item was added
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      });
  };

  self.updatePlaylist = function () {
    self._serviceRequest('playlist', 'list')
      .done(function (data) {
        self.playlist(data);
        self.messages('');
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      });
  };
  

  /* DRAG DROP Fns */
  self.dragItem = {};

  self.notifyPlaylistPosition = function (id, index) {
    self._serviceRequest('playlist', ['move', id, 'to', index])
      .done(function (data) {
        // NOTE : Socket message will come back to indicate that a playlist item was added
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      });
  };

  self.dragOver = function (item, e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.target.classList.remove('insertAbove');
    e.target.classList.remove('insertBelow');

    var yPosition = e.clientY - e.target.getBoundingClientRect().top;
    var isAbove = yPosition <= (e.target.getBoundingClientRect().height / 2);
    if (isAbove) {
      e.target.classList.add('insertAbove');
    }
    else {
      e.target.classList.add('insertBelow');
    }

    e.dataTransfer.dropEffect = 'move';

    return true;
  };

  self.dragEnter = function (item, e) {
    return true;
  };

  self.dragLeave = function (item, e) {
    e.target.classList.remove('insertAbove');
    e.target.classList.remove('insertBelow');
    return true;
  };

  self.dragDrop = function (item, e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (self.dragItem !== item) {
      var newIndex = self.playlist.indexOf(item);

      var yPosition = e.clientY - e.target.getBoundingClientRect().top;
      var isAbove = yPosition <= (e.target.getBoundingClientRect().height / 2);
      if (!isAbove)
        newIndex++;

      self.notifyPlaylistPosition(self.dragItem['id'], newIndex);
    }
    e.target.classList.remove('insertAbove');
    e.target.classList.remove('insertBelow');
    self.dragItem = {};
    return true;
  };

  self.dragStart = function (item, e) {
    self.dragItem = item;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.classList.add('dragging');
    return true;
  };

  self.dragEnd = function (item, e) {
    e.target.classList.remove('insertAbove');
    e.target.classList.remove('insertBelow');
    e.target.classList.remove('dragging');
    return true;
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
                  self.playlist.push(data);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                  self.messages(errorThrown);
                  $("#messages").attr("class", "alert alert-danger");
                  // TODO : Text not displaying correctly
                  $("#track-info").html("Error: " + errorThrown);
                });
              break;
            case 'remove':
              self._removePlaylistItemImpl(data['id']);
              break;
            case 'clear':
              self.playlist([]);
              break;
            case 'move':
              var originalIndex = self.indexOfArrayEx(self.playlist(), 'id', data['id']);

              if (originalIndex !== -1) {
                var item = self.playlist()[originalIndex];
                var newIndex = data['index'];
                self.playlist.splice(originalIndex, 1);
                self.playlist.splice(newIndex, 0, item);
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

    // Init Playlist
    self.updatePlaylist();

    self.socketConnect();
  };


}

var vm = new ViewModel();
vm.Init();
