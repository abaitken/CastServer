
function ViewModel() {
  var self = this;
  self.dataReady = ko.observable(false);
	self.messages = ko.observable("Fetching...");
	self.playlist = [];

	self._initTreeView = function() {
		$("#treeview").on("changed.jstree", function(e, data) {
      var r = [];
      for (var i = 0, j = data.selected.length; i < j; i++) {
        r.push(data.instance.get_node(data.selected[i]).id);
      }

      var id = r[0];

      var url = "/info/" + id;

      $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        mimeType: "application/json",
        success: function(data) {
          $("#track-info").html(data["res"]);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          self.messages(errorThrown);
          $("#messages").attr("class", "alert alert-danger");
          // TODO : Text not displaying correctly
          $("#track-info").html("Error: " + errorThrown);
        }
      });
		});
		

    $("#treeview").jstree({
      core: {
        data: function(node, cb) {
          if (node.id === "err") return;

          var url = "/browse";
          if (node.id !== "#") url = url + "/" + node.id;

          $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            mimeType: "application/json",
            success: function(data) {
              var nodes = [];

              if (data["container"])
                if (Array.isArray(data.container))
                  data.container.forEach(function(item, index, array) {
                    nodes.push({
                      text: item["dc:title"],
                      id: item["$"]["id"],
                      children: item["$"]["childCount"] !== "0"
                    });
                  });
                else {
                  var item = data.container;
                  nodes.push({
                    text: item["dc:title"],
                    id: item["$"]["id"],
                    children: item["$"]["childCount"] !== "0"
                  });
                }

              if (data["item"])
                if (Array.isArray(data.item))
                  data.item.forEach(function(item, index, array) {
                    nodes.push({
                      text: item["dc:title"],
                      id: item["$"]["id"],
                      children: false,
                      icon: "jstree-file"
                    });
                  });
                else {
                  var item = data.item;
                  nodes.push({
                    text: item["dc:title"],
                    id: item["$"]["id"],
                    children: false,
                    icon: "jstree-file"
                  });
                }

              cb(nodes);
            },
            error: function(jqXHR, textStatus, errorThrown) {
              self.messages(errorThrown);
              $("#messages").attr("class", "alert alert-danger");
              // TODO : Text not displaying correctly
              cb([
                { text: "Error: " + errorThrown, id: "err", children: false }
              ]);
            }
          });
        }
      }
    });
	};

	self.Init = function() {
    ko.applyBindings(self);
		self._initTreeView();
		
		$.ajax({
			type: "GET",
			url: '/playlist/list',
			dataType: "json",
			mimeType: "application/json",
			success: function(data) {
				self.playlist = data;
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
