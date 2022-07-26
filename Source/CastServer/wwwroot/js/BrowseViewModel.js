const ITEM_TYPES = {
    UNKNOWN: 0,
    CONTAINER: 1,
    MUSIC: 2,
    PHOTO: 3
};

function ViewModel() {
    let self = this;
    self.ITEM_TYPES = ITEM_TYPES;

    self.folderData = ko.observableArray([]);
    self.breadcrumb = ko.observableArray([]);
    self.focusItem = ko.observable(false);

    self.addEntityToPlaylist = function (item) {
        //$.ajax({
        //    type: 'POST',
        //    url: 'api/Playlist?id=' + item['id'] + '&op=' + 'add',
        //    dataType: 'json',
        //    mimeType: 'application/json',
        //    success: function (data) {
        //        // NOTE : Message will come back to indicate that a playlist item was added
        //    },
        //    error: function (jqXHR, textStatus, errorThrown) {
        //        //root.errors.error(errorThrown);
        //    }
        //});
    };

    self.breadcrumbJump = function (item) {
        self.set_currentContainerId(item['id']);
    };

    self.requestData = function (id, page) {
        $.ajax({
            type: 'GET',
            url: 'api/Browse/' + id + '/' + page,
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                self.folderData(self.folderData().concat(data.items));
                if (data.items.length > 0)
                    self.requestData(id, page + 1); // TODO : Replace with smart scrolling
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    self.switchFolderView = function (id) {
        self.set_currentContainerId(id);
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

    self.itemClicked = function (item) {
        if (self._determineItemType(item['type']) == ITEM_TYPES.CONTAINER) {
            self.switchFolderView(item['id']);
            return;
        }

        if (self._determineItemType(item['type']) == ITEM_TYPES.MUSIC) {
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

    self._updateBreadCrumb = async function () {
        var currentId = self.get_currentContainerId();

        $.ajax({
            type: 'GET',
            url: 'api/Breadcrumb/' + currentId,
            dataType: 'json',
            mimeType: 'application/json',
            success: function (data) {
                self.breadcrumb(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //root.errors.error(errorThrown);
            }
        });
    };

    window.onhashchange = function () {
        self.focusItem(false);
        self.folderData([]);
        self.requestData(self.get_currentContainerId(), 0);
        self._updateBreadCrumb();
    };
    self.switchFolderView(self.get_currentContainerId());
}

ko.applyBindings(new ViewModel());