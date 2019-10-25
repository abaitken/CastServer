var g_request = require("request-promise-native");
var g_decode = require("unescape");
var g_xml2js = require("xml2js");
var g_parser = new g_xml2js.Parser({ explicitArray: false });

module.exports = {

    Client: class DLNAClient {
        constructor(protocol, domain) {
            this._protocol = protocol;
            this._domain = domain;
        }

        _request(requestBody, soapaction, timeout, callback) {
            var requestHeaders = {
                "cache-control": "no-cache",
                soapaction: soapaction,
                "content-type": "text/xml;charset=UTF-8"
            };

            var requestOptions = {
                method: "POST",
                url: this._protocol + "://" + this._domain + "/ctl/ContentDir",
                qs: { wsdl: "" },
                headers: requestHeaders,
                body: requestBody,
                timeout: timeout
            };

            g_request(requestOptions)
                .then(function (body) {
                    callback(body, null);
                })
                .catch(function (error) {
                    callback(null, error);
                });
        }

        SearchCapabilities(requestInfo, callback) {
            var requestBody =
                '<?xml version="1.0"?>' +
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                "<s:Body>" +
                '<u:GetSearchCapabilities xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
                "</u:GetSearchCapabilities>" +
                "</s:Body>" +
                "</s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSearchCapabilities", requestInfo.timeout,
                function (body, error) {
                    if (error !== null) {
                        callback(body, error);
                        return;
                    }

                    console.log(body);
                    const getResultRegex = /<SearchCaps>(?<DATA>[^]+)<\/SearchCaps>/;
                    var match = getResultRegex.exec(body);
                    var data = match["groups"]["DATA"];

                    callback(data, null);
                });
        }

        SortCapabilities(requestInfo, callback) {
            var requestBody =
                '<?xml version="1.0"?>' +
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                "<s:Body>" +
                '<u:GetSortCapabilities xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
                "</u:GetSortCapabilities>" +
                "</s:Body>" +
                "</s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSortCapabilities", requestInfo.timeout,
                function (body, error) {
                    if (error !== null) {
                        callback(body, error);
                        return;
                    }

                    console.log(body);
                    const getResultRegex = /<SortCaps>(?<DATA>[^]+)<\/SortCaps>/;
                    var match = getResultRegex.exec(body);
                    var data = match["groups"]["DATA"];

                    callback(data, null);
                });
        }

        SystemUpdateID(requestInfo, callback) {
            var requestBody =
                '<?xml version="1.0"?>' +
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                "<s:Body>" +
                '<u:GetSystemUpdateID xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
                "</u:GetSystemUpdateID>" +
                "</s:Body>" +
                "</s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSystemUpdateID", requestInfo.timeout,
                function (body, error) {
                    if (error !== null) {
                        callback(body, error);
                        return;
                    }

                    console.log(body);
                    const getResultRegex = /<SortCaps>(?<DATA>[^]+)<\/SortCaps>/;
                    var match = getResultRegex.exec(body);
                    var data = match["groups"]["DATA"];

                    callback(data, null);
                });
        }

        Browse(requestInfo, callback) {
            var requestBody =
                '<?xml version="1.0"?>' +
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                "<s:Body>" +
                '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
                "<ObjectID>" + requestInfo.objectId + "</ObjectID>" +
                "<BrowseFlag>BrowseDirectChildren</BrowseFlag>" +
                "<Filter>*</Filter>" +
                "<StartingIndex>" + requestInfo.startingIndex + "</StartingIndex>" +
                "<RequestedCount>" + requestInfo.requestedCount + "</RequestedCount>" +
                "<SortCriteria>" + requestInfo.sortCriteria + "</SortCriteria>" +
                "</u:Browse>" +
                "</s:Body>" +
                "</s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Browse", requestInfo.timeout,
                function (body, error) {
                    if (error !== null) {
                        callback(body, error);
                        return;
                    }
                    const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
                    var match = getResultRegex.exec(body);
                    var data = g_decode(match["groups"]["DATA"]);

                    let jsonData;
                    g_parser.parseString(data, function (err, parseResult) {
                        jsonData = parseResult["DIDL-Lite"];
                    });

                    callback(jsonData, null);
                });
        }

        Info(requestInfo, callback) {
            var requestBody =
                '<?xml version="1.0"?>' +
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                "<s:Body>" +
                '<u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">' +
                "<ObjectID>" + requestInfo.objectId + "</ObjectID>" +
                "<BrowseFlag>BrowseMetadata</BrowseFlag>" +
                "<Filter>*</Filter>" +
                "<StartingIndex>0</StartingIndex>" +
                "<RequestedCount>0</RequestedCount>" +
                "<SortCriteria></SortCriteria>" +
                "</u:Browse>" +
                "</s:Body>" +
                "</s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Browse", requestInfo.timeout,
                function (body, error) {
                    if (error !== null) {
                        callback(body, error);
                        return;
                    }
                    const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
                    var match = getResultRegex.exec(body);
                    var data = g_decode(match["groups"]["DATA"]);

                    let jsonData;
                    g_parser.parseString(data, function (err, parseResult) {
                        jsonData = parseResult["DIDL-Lite"];
                    });

                    callback(jsonData, null);
                });
        }

        Search(requestInfo, callback) {
            var requestBody =
                '<?xml version="1.0"?>' +
                '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                "<s:Body>" +
                "<ObjectID>" + requestInfo.objectId + "</ObjectID>" +
                //"<BrowseFlag>BrowseDirectChildren</BrowseFlag>" +
                "<Filter>*</Filter>" +
                "<StartingIndex>" + requestInfo.startingIndex + "</StartingIndex>" +
                "<RequestedCount>" + requestInfo.requestedCount + "</RequestedCount>" +
                "<SortCriteria>" + requestInfo.sortCriteria + "</SortCriteria>" +
                "<SearchCriteria>" + requestInfo.searchCriteria + "</SearchCriteria>" +
                "</s:Body>" +
                "</s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Search", requestInfo.timeout,
                function (body, error) {
                    if (error !== null) {
                        callback(body, error);
                        return;
                    }
                    const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
                    var match = getResultRegex.exec(body);
                    var data = g_decode(match["groups"]["DATA"]);

                    let jsonData;
                    g_parser.parseString(data, function (err, parseResult) {
                        jsonData = parseResult["DIDL-Lite"];
                    });

                    callback(jsonData, null);
                });
        }

    }
}