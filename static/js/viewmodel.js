import $ from 'jquery';
import ko from 'knockout';
import 'bootstrap';
import 'popper.js';

function ViewModel() {
  var self = this;
  self.dataReady = ko.observable(false);
  self.messages = ko.observable("Fetching...");
  self.folderData = ko.observable();
  self.playlist = [];
  self.breadcrumb = ko.observableArray();

  self.breadcrumbJump = function(item){

    for(var i = self.breadcrumb().length - 1; i > 0; i--)
    {
      if(self.breadcrumb()[i]['id'] != item['id'])
        self.breadcrumb.pop();
    }
    self.switchFolderView(item['id']);
  };
  
  self.switchFolderView = function (id) {
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

  self.itemClicked = function (item) {
    if (item['class'].indexOf('Folder') !== -1) {
      self.breadcrumb.push(item);
      self.switchFolderView(item['id']);
    }
  };

  self.Init = function () {
    ko.applyBindings(self);
    self.breadcrumb.push({
      title: 'Root',
      id: '#'
    })
    self.switchFolderView('#');


    // $.ajax({
    // 	type: "GET",
    // 	url: '/playlist/list',
    // 	dataType: "json",
    // 	mimeType: "application/json",
    // 	success: function(data) {
    // 		self.playlist = data;
    // 	},
    // 	error: function(jqXHR, textStatus, errorThrown) {
    // 		self.messages(errorThrown);
    // 		$("#messages").attr("class", "alert alert-danger");
    // 		// TODO : Text not displaying correctly
    // 		$("#track-info").html("Error: " + errorThrown);
    // 	}
    // });

    self.dataReady(true);
  };

}

var vm = new ViewModel();
vm.Init();
