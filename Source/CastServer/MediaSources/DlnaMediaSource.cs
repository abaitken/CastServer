using System;
using System.Collections;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.RegularExpressions;

namespace CastServer.MediaSources
{
    public class DlnaMediaSource
    {
        private readonly string _protocol;
        private readonly string _domain;

        public DlnaMediaSource(string protocol, string domain)
        {
            _protocol = protocol;
            _domain = domain;
        }


        private dynamic RedefineContainer(dynamic item)
        {
            return new
            {
                id = item["$"]["id"],
                parentID = item["$"]["parentID"],
                childCount = item["$"]["childCount"],
                title = item["dc:title"],
                @class = item["upnp:class"],
                // TODO : Can be an array!
                albumArtURI = item["upnp:albumArtURI"]["_"]
            };
        }

        private dynamic RedefineMusic(dynamic item)
        {
            return new
            {
                id = item["$"]["id"],
                parentID = item["$"]["parentID"],
                title = item["dc:title"],
                creator = item["dc:creator"],
                artist = item["upnp:artist"],
                album = item["upnp:album"],
                genre = item["upnp:genre"],
                // TODO : Can be an array! for images
                res = item["res"]["_"],
                @class = item["upnp:class"],
                size = item["res"]["$"]["size"],
                duration = item["res"]["$"]["duration"],
                bitrate = item["res"]["$"]["bitrate"],
                sampleFrequency = item["res"]["$"]["sampleFrequency"],
                nrAudioChannels = item["res"]["$"]["nrAudioChannels"],
                protocolInfo = item["res"]["$"]["protocolInfo"],
                originalTrackNumber = item["upnp:originalTrackNumber"],
                albumArtURI = item["upnp:albumArtURI"]["_"]
            };
        }

        private dynamic RedefineUnknown(dynamic item)
        {
            return new
            {
                id = item["$"]["id"],
                parentID = item["$"]["parentID"],
                title = item["dc:title"],
                @class = item["upnp:class"],
            };
        }

        private dynamic RedefineItem(dynamic item)
        {
            var classType = item["upnp:class"];
            if (classType.toLowerCase().indexOf("folder") != -1)
            {
                return RedefineContainer(item);
            }

            if (classType.toLowerCase().indexOf("track") != -1)
            {
                return RedefineMusic(item);
            }

            return RedefineUnknown(item);
        }

        private List<dynamic> RestructureEntities(dynamic o)
        {
            var result = new List<dynamic>();

            if (o != null)
            {
                if (o is IEnumerable a)
                {
                    foreach (var item in a)
                        result.Add(RedefineItem(item));
                }
                else
                {
                    result.Add(RedefineItem(o));
                }
            }
            return result;
        }

        private dynamic ProcessDNLAData(dynamic data)
        {
            var containers = RestructureEntities(data["container"]);
            var items = RestructureEntities(data["item"]);
            var resultItems = containers.concat(items);

            var result = new {
                items = resultItems
            };
            return result;
        }

        private bool _request(string requestBody, string soapAction, out string body)
        {
            using var client = new HttpClient();

            var content = new StringContent(requestBody);
            content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/xml;charset=UTF-8");
            content.Headers.Add("cache-control", "no-cache");
            content.Headers.Add("SOAPACTION", soapAction);
            client.Timeout = TimeSpan.FromSeconds(5);
            var requestTask = client.PostAsync($"{_protocol}://{_domain}/ctl/ContentDir", content);
            requestTask.Wait();

            var response = requestTask.Result;

            body = response.Content.ToString();
            return true;
        }

        public IEnumerable<string> SearchCapabilities()
        {
            var requestBody = @"<?xml version=""1.0""?>
                <s:Envelope xmlns:s=""http://schemas.xmlsoap.org/soap/envelope/"" s:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">
                <s:Body>
                <u:GetSearchCapabilities xmlns:u=""urn:schemas-upnp-org:service:ContentDirectory:1"">
                </u:GetSearchCapabilities>
                </s:Body>
                </s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSearchCapabilities", out var body);

            //const getResultRegex = /<SearchCaps>(?<DATA>[^]+)<\/SearchCaps>/;
            var regex = new Regex(@"<SearchCaps>(?<DATA>.+?)<\/SearchCaps>");
            var matches = regex.Matches(body);

            foreach (Match match in matches)
                yield return match.Groups["DATA"].Value;
        }

        public IEnumerable<string> SortCapabilities()
        {
            var requestBody = @"<?xml version=""1.0""?>
                <s:Envelope xmlns:s=""http://schemas.xmlsoap.org/soap/envelope/"" s:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">
                <s:Body>
                <u:GetSortCapabilities xmlns:u=""urn:schemas-upnp-org:service:ContentDirectory:1"">
                </u:GetSortCapabilities>
                </s:Body>
                </s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSortCapabilities", out var body);

            //const getResultRegex = /<SortCaps>(?<DATA>[^]+)<\/SortCaps>/;
            var regex = new Regex(@"<SortCaps>(?<DATA>.+?)<\/SortCaps>");
            var matches = regex.Matches(body);

            foreach (Match match in matches)
                yield return match.Groups["DATA"].Value;
        }

        public IEnumerable<string> SystemUpdateID()
        {
            var requestBody = @"<?xml version=""1.0""?>
                <s:Envelope xmlns:s=""http://schemas.xmlsoap.org/soap/envelope/"" s:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">
                <s:Body>
                <u:GetSystemUpdateID xmlns:u=""urn:schemas-upnp-org:service:ContentDirectory:1"">
                </u:GetSystemUpdateID>
                </s:Body>
                </s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#GetSystemUpdateID", out var body);

            // TODO : This seems wrong!!
            //const getResultRegex = /<SortCaps>(?<DATA>[^]+)<\/SortCaps>/;
            var regex = new Regex(@"<SortCaps>(?<DATA>.+?)<\/SortCaps>");
            var matches = regex.Matches(body);

            foreach (Match match in matches)
                yield return match.Groups["DATA"].Value;
        }

        public IEnumerable<dynamic> Browse(string objectId, int startingIndex, int requestedCount, string sortCriteria)
        {
            var requestBody = $@"<?xml version=""1.0""?>
                <s:Envelope xmlns:s=""http://schemas.xmlsoap.org/soap/envelope/"" s:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">
                <s:Body>
                <u:Browse xmlns:u=""urn:schemas-upnp-org:service:ContentDirectory:1"">
                <ObjectID>{objectId}</ObjectID>
                <BrowseFlag>BrowseDirectChildren</BrowseFlag>
                <Filter>*</Filter>
                <StartingIndex>{startingIndex}</StartingIndex>
                <RequestedCount>{requestedCount}</RequestedCount>
                <SortCriteria>{sortCriteria}</SortCriteria>
                </u:Browse>
                </s:Body>
                </s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Browse", out var body);
            /*
             
                    const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
                    var match = getResultRegex.exec(body);
                    var data = g_decode(match["groups"]["DATA"]);

                    let structuredArrayData;
                    g_parser.parseString(data, function (err, parseResult) {
                        structuredArrayData = parseResult["DIDL-Lite"];
                    });

                    return ProcessDNLAData(structuredArrayData);
            */

            return null;
        }

        public dynamic Info(string objectId)
        {
            var requestBody = $@"<?xml version=""1.0""?>
                <s:Envelope xmlns:s=""http://schemas.xmlsoap.org/soap/envelope/"" s:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">
                <s:Body>
                <u:Browse xmlns:u=""urn:schemas-upnp-org:service:ContentDirectory:1"">
                <ObjectID>{objectId}</ObjectID>
                <BrowseFlag>BrowseMetadata</BrowseFlag>
                <Filter>*</Filter>
                <StartingIndex>0</StartingIndex>
                <RequestedCount>0</RequestedCount>
                <SortCriteria></SortCriteria>
                </u:Browse>
                </s:Body>
                </s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Browse", out var body);
            /*
                    const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
                    var match = getResultRegex.exec(body);
                    var data = g_decode(match["groups"]["DATA"]);

                    let structuredArrayData;
                    g_parser.parseString(data, function (err, parseResult) {
                        structuredArrayData = parseResult["DIDL-Lite"];
                    });

                    return ProcessDNLAData(structuredArrayData).items[0];
             */
            return null;
        }

        public dynamic Search(string objectId, int startingIndex, int requestedCount, string sortCriteria, string searchCriteria)
        {
            //<BrowseFlag>BrowseDirectChildren</BrowseFlag>
            var requestBody = $@"<?xml version=""1.0""?>
                <s:Envelope xmlns:s=""http://schemas.xmlsoap.org/soap/envelope/"" s:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">
                <s:Body>
                <ObjectID>{objectId}</ObjectID>
                <Filter>*</Filter>
                <StartingIndex>{startingIndex}</StartingIndex>
                <RequestedCount>{requestedCount}</RequestedCount>
                <SortCriteria>{sortCriteria}</SortCriteria>
                <SearchCriteria>{searchCriteria}</SearchCriteria>
                </s:Body>
                </s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Search", out var body);

            /*
                    const getResultRegex = /<Result>(?<DATA>[^]+)<\/Result>/;
                    var match = getResultRegex.exec(body);
                    var data = g_decode(match["groups"]["DATA"]);

                    let structuredArrayData;
                    g_parser.parseString(data, function (err, parseResult) {
                        structuredArrayData = parseResult["DIDL-Lite"];
                    });

                    return ProcessDNLAData(structuredArrayData, null);
            */
            return null;
        }
    }
}
