function RedefineContainer(item) {

    return {
        id: item['$']['id'],
        parentID: item['$']['parentID'],
        childCount: item['$']['childCount'],
        title: item['dc:title'],
        class: item['upnp:class'],
        // TODO : Can be an array!
        albumArtURI: ['upnp:albumArtURI']['_']
    };
}

function RedefineMusic(item) {
    return {
        id: item['$']['id'],
        parentID: item['$']['parentID'],
        title: item['dc:title'],
        creator: item['dc:creator'],
        artist: item['upnp:artist'],
        album: item['upnp:album'],
        genre: item['upnp:genre'],
        // TODO : Can be an array! for images
        res: item['res']['_'],
        class: item['upnp:class'],
        size: item['res']['$']['size'],
        duration: item['res']['$']['duration'],
        bitrate: item['res']['$']['bitrate'],
        sampleFrequency: item['res']['$']['sampleFrequency'],
        nrAudioChannels: item['res']['$']['nrAudioChannels'],
        protocolInfo: item['res']['$']['protocolInfo'],
        originalTrackNumber: item['upnp:originalTrackNumber'],
        albumArtURI: ['upnp:albumArtURI']['_']
    };
}

function RedefineUnknown(item) {
    return {
        id: item['$']['id'],
        parentID: item['$']['parentID'],
        title: item['dc:title'],
        class: item['upnp:class'],
    };
};

function RedefineItem(item) {
    var classType = item['upnp:class'];
    if (classType.toLowerCase().indexOf('folder') !== -1) {
        return RedefineContainer(item);
    }

    if (classType.toLowerCase().indexOf('track') !== -1) {
        return RedefineMusic(item);
    }

    return RedefineUnknown(item);
}

function RestructureEntities(o) {
    var result = [];

    if (o) {
        if (Array.isArray(o)) {
            for (const key in o) {
                var item = o[key];
                result.push(RedefineItem(item));
            }
        }
        else {
            result.push(RedefineItem(o));
        }
    }
    return result;
}


module.exports = {

    ProcessDNLAData: function (data) {
        var containers = RestructureEntities(data["container"]);
        var items = RestructureEntities(data["item"]);
        var resultItems = containers.concat(items);

        var result = {
            items: resultItems
        };
        return result;
    }
}