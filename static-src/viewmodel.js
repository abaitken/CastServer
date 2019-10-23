import $ from 'jquery';
import ko from 'knockout';
import 'bootstrap';
import 'popper.js';
import '@fortawesome/fontawesome-free/js/all.js'
import '@fortawesome/fontawesome-free/css/all.css'
require('file-loader?name=[name].[ext]!./index.html');
import './custom.scss';

var ITEM_TYPES = {
  UNKNOWN: 0,
  CONTAINER: 1,
  MUSIC: 2
};

function ViewModel() {
  var self = this;
  self.ITEM_TYPES = ITEM_TYPES;

  self.dataReady = ko.observable(false);
  self.messages = ko.observable("Fetching...");
  self.folderData = ko.observableArray();
  self.playlist = ko.observableArray();
  self.breadcrumb = ko.observableArray();
  self.focusItem = ko.observable(false);

  self.addEntityToPlaylist = function (item) {
    self.playlist.push(item);
  };

  self._breadcrumbJumpImpl = function (id) {
    for (var i = self.breadcrumb().length - 1; i > 0; i--) {
      if (self.breadcrumb()[i]['id'] == id)
        break;
      self.breadcrumb.pop();
    }
    self.switchFolderView(id);
  };

  self.breadcrumbJump = function (item) {
    self._breadcrumbJumpImpl(item['id']);
  };

  self.switchFolderView = function (id) {
    self.focusItem(false);
    window.location.href = "#" + id;
    var url = "/browse/" + id;
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",
      mimeType: "application/json",
      success: function (data) {
        self.folderData(data.items);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      }
    });
  };

  self._determineItemType = function (classType) {
    if (classType.toLowerCase().indexOf('folder') !== -1) {
      return ITEM_TYPES.CONTAINER;
    }

    if (classType.toLowerCase().indexOf('track') !== -1) {
      return ITEM_TYPES.MUSIC;
    }

    return ITEM_TYPES.UNKNOWN;
  };

  self.itemClicked = function (item) {
    if (self._determineItemType(item['class']) == ITEM_TYPES.CONTAINER) {
      self.breadcrumb.push(item);
      self.switchFolderView(item['id']);
      return;
    }

    if (self._determineItemType(item['class']) == ITEM_TYPES.MUSIC) {
      self.focusItem(item);
      return;
    }
  };

  self.Init = function () {
    ko.applyBindings(self);
    self.breadcrumb.push({
      title: 'Root',
      id: '0'
    })
    self.switchFolderView('0');


    $.ajax({
      type: "GET",
      url: '/playlist/list',
      dataType: "json",
      mimeType: "application/json",
      success: function (data) {
        self.playlist(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      }
    });

    self.dataReady(true);
  };

}

var vm = new ViewModel();
vm.Init();
