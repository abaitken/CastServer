import $ from 'jquery';
import ko from 'knockout';
import 'bootstrap';
import 'popper.js';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/themes/default/style.min.css';
import '../css/custom.css';

function ViewModel() {
  var self = this;
  self.dataReady = ko.observable(false);
  self.messages = ko.observable("Fetching...");
  self.folderData = ko.observable();
  self.playlist = ko.observableArray();
  self.breadcrumb = ko.observableArray();
  self.focusItem = ko.observable(false);

  self.addEntityToPlaylist = function(item){
    self.playlist.push(item);
  };
  self.breadcrumbJump = function (item) {
    for (var i = self.breadcrumb().length - 1; i > 0; i--) {
      if (self.breadcrumb()[i]['id'] == item['id'])
        break;
      self.breadcrumb.pop();      
    }
    self.switchFolderView(item['id']);
  };

  self.switchFolderView = function (id) {
    self.focusItem(false);
    var url = "/browse";
    if (id !== "#") url = url + "/" + id;
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",
      mimeType: "application/json",
      success: function (data) {
        self.folderData(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        self.messages(errorThrown);
        $("#messages").attr("class", "alert alert-danger");
        // TODO : Text not displaying correctly
        $("#track-info").html("Error: " + errorThrown);
      }
    });
  };

  self.folderClicked = function (item) {
    self.breadcrumb.push(item);
    self.switchFolderView(item['id']);
  };

  self.itemClicked = function (item) {
    self.focusItem(item);
  };

  self.Init = function () {
    ko.applyBindings(self);
    self.breadcrumb.push({
      title: 'Root',
      id: '#'
    })
    self.switchFolderView('#');


    $.ajax({
    	type: "GET",
    	url: '/playlist/list',
    	dataType: "json",
    	mimeType: "application/json",
    	success: function(data) {
    		self.playlist(data);
    	},
    	error: function(jqXHR, textStatus, errorThrown) {
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
