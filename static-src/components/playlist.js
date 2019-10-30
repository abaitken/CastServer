const view = require("./playlist.html");

module.exports = function (ko, $) {
    return {
        viewModel: function (root) {
            var self = this;

            self.playlist = ko.observableArray();

            /* BEGIN PLAYLIST Fns */
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

            self._removePlaylistItemImpl = function (id) {
                var itemIndex = root.indexOfArrayEx(self.playlist(), 'id', id);
                if (itemIndex !== -1)
                    self.playlist.splice(itemIndex, 1);
            };

            self.removeEntityFromPlaylist = function (item) {

                root._serviceRequest('playlist', ['remove', item['id']])
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

            self.clearPlaylist = function () {
                if (self.playlist().length === 0)
                    return;

                if (!confirm("Remove all items from the playlist?"))
                    return;
                root._serviceRequest('playlist', 'clear')
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

            self.updatePlaylist = function () {
                root._serviceRequest('playlist', 'list')
                    .done(function (data) {
                        self.playlist(data);
                        root.messages('');
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.messages(errorThrown);
                        $("#messages").attr("class", "alert alert-danger");
                        // TODO : Text not displaying correctly
                        $("#track-info").html("Error: " + errorThrown);
                    });
            };


            /* DRAG DROP Fns */
            self.dragItem = {};

            self.notifyPlaylistPosition = function (id, index) {
                root._serviceRequest('playlist', ['move', id, 'to', index])
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

            self.updatePlaylist();
        },
        template: view
    };
};