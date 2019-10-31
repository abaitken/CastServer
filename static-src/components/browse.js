const view = require("./browse.html");

var ITEM_TYPES = {
    UNKNOWN: 0,
    CONTAINER: 1,
    MUSIC: 2,
    PHOTO: 3
};

module.exports = function (ko, $) {
    return {
        viewModel: function (root) {
            var self = this;
            self.ITEM_TYPES = ITEM_TYPES;

            self.folderData = ko.observableArray();
            self.breadcrumb = ko.observableArray();
            self.focusItem = ko.observable(false);

            self.addEntityToPlaylist = function (item) {
                root._serviceRequest('playlist', ['add', item['id']])
                    .done(function (data) {
                        // NOTE : Socket message will come back to indicate that a playlist item was added
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });
            };

            self.breadcrumbJump = function (item) {
                self.set_currentContainerId(item['id']);
            };

            self.requestData = function (id, page) {
                root._serviceRequest('browse', [id, page])
                    .done(function (data) {
                        for (var i = 0; i < data.items.length; i++) {
                            self.folderData.push(data.items[i]);
                        }
                        if (data.items.length > 0)
                            self.requestData(id, page + 1);
                        root.messages('');
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });
            };

            self.switchFolderView = function (id) {
                self.focusItem(false);
                self.folderData([]);

                self.requestData(id, 0);
            };

            self._determineItemType = function (classType) {
                if (classType.toLowerCase().indexOf('folder') !== -1) {
                    return ITEM_TYPES.CONTAINER;
                }

                if (classType.toLowerCase().indexOf('track') !== -1) {
                    return ITEM_TYPES.MUSIC;
                }

                if (classType.toLowerCase().indexOf('photo') !== -1) {
                    return ITEM_TYPES.PHOTO;
                }

                return ITEM_TYPES.UNKNOWN;
            };

            self.canPlay = function (item) {
                var itemType = self._determineItemType(item['class']);
                switch (itemType) {
                    case ITEM_TYPES.CONTAINER:
                    case ITEM_TYPES.MUSIC:
                        return true;
                    default:
                        return false;
                }
            };

            self.itemClicked = function (item) {
                if (self._determineItemType(item['class']) == ITEM_TYPES.CONTAINER) {
                    self.breadcrumb.push(item);
                    self.set_currentContainerId(item['id']);
                    return;
                }

                if (self._determineItemType(item['class']) == ITEM_TYPES.MUSIC) {
                    self.focusItem(item);
                    return;
                }
            };

            self.closeTrackInfo = function () {
                self.focusItem(false);
            };

            self.get_currentContainerId = function () {
                if (window.location.hash.length <= 1)
                    return '0';

                return window.location.hash.substr(1);
            };

            self.set_currentContainerId = function (value) {
                window.location.hash = "#" + value;
            };

            self._getBreadCrumbIndex = function (id) {
                for (var i = self.breadcrumb().length - 1; i > 0; i--) {
                    if (self.breadcrumb()[i]['id'] == id)
                        return i;
                }
                return -1;
            };

            self._updateBreadCrumb = async function () {
                var currentId = self.get_currentContainerId();
                var breadCrumbIndex = self._getBreadCrumbIndex(currentId);

                if (breadCrumbIndex === -1) {
                    var newBreadcrumb = [];

                    var currentId = self.get_currentContainerId();
                    while (currentId != '-1') {
                        await root._serviceRequest('info', currentId)
                            .done(function (data) {
                                newBreadcrumb.splice(0, 0, data);
                                currentId = data['parentID'];
                            })
                            .fail(function (jqXHR, textStatus, errorThrown) {
                                root.messages(errorThrown);
                                $("#messages").attr("class", "alert alert-danger");
                                // TODO : Text not displaying correctly
                                $("#track-info").html("Error: " + errorThrown);
                            });
                    }

                    self.breadcrumb(newBreadcrumb);
                }
                else {
                    var newBreadcrumb = self.breadcrumb();
                    self.breadcrumb(newBreadcrumb.slice(0, breadCrumbIndex + 1));
                }
            };


            window.onhashchange = function () {
                self._updateBreadCrumb();
                self.switchFolderView(self.get_currentContainerId());
            };
            self._updateBreadCrumb();
            self.switchFolderView(self.get_currentContainerId());


        },
        template: view
    };
};