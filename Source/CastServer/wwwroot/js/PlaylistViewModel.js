function ViewModel(root) {
    var self = this;

    self.playlist = ko.observableArray();

    self._removePlaylistItemImpl = function (id) {
        var itemIndex = root.indexOfArrayEx(self.playlist(), 'id', id);
        if (itemIndex !== -1)
            self.playlist.splice(itemIndex, 1);
    };

    self.removeEntityFromPlaylist = function (item) {

        $.ajax({
            type: 'POST',
            url: 'api/Playlist?id=' + item['id'] + '&op=' + 'remove',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to indicate that a playlist item was added
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });

    };

    self.clearPlaylist = function () {
        if (self.playlist().length === 0)
            return;

        if (!confirm("Remove all items from the playlist?"))
            return;

        $.ajax({
            type: 'POST',
            url: 'api/Playlist?id=' + '-1' + '&op=' + 'clear',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to indicate that a playlist item was added
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.updatePlaylist = function () {
        $.ajax({
            type: 'GET',
            url: 'api/Playlist',
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                self.playlist(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.moveImpl = function (id, newIndex) {
        var originalIndex = root.indexOfArrayEx(self.playlist(), 'id', id);

        if (originalIndex !== -1) {
            var item = self.playlist()[originalIndex];
            self.playlist.splice(originalIndex, 1);
            self.playlist.splice(newIndex, 0, item);
        }
    };

    /* DRAG DROP Fns */
    self.dragItem = {};

    self.notifyPlaylistPosition = function (id, index) {
        $.ajax({
            type: 'POST',
            url: 'api/PlaylistMove?id=' + id + '&to=' + index,
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                // NOTE : Message will come back to indicate that a playlist item was added
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
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

    self.onRoutedEvent = function (eventName, args) {

        if (eventName !== 'socketmessage')
            return;

        var data = args;

        if (data['category'] !== 'playlist')
            return;

        if (!data['action']) {
            console.log("No action for playlist category");
            return;
        }

        switch (data['action']) {
            case 'add':
                root._serviceRequest('info', data['id'])
                    .done(function (data) {
                        self.playlist.push(data);
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        root.errors.error(errorThrown);
                    });
                break;
            case 'remove':
                self._removePlaylistItemImpl(data['id']);
                break;
            case 'clear':
                self.playlist([]);
                break;
            case 'move':
                self.moveImpl(data['id'], data['index']);
                break;
            default:
                console.log("Unexpected action: " + data['action']);
                break;
        }
    };
    self.updatePlaylist();
}

ko.applyBindings(new ViewModel());