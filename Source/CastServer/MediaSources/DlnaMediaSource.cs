using CastServer.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
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

        private IEnumerable<DLNAItem> ParseResultBodyForDLNAStructures(string body)
        {
            var regex = new Regex(@"<Result>(?<DATA>.+?)<\/Result>", RegexOptions.Singleline);
            var match = regex.Match(body);
            if (!match.Success)
                return Enumerable.Empty<DLNAItem>();

            var data = match.Groups["DATA"].Value;
            return DlnaDataParser.FromEncodedString(data);
        }


        private bool _request(string requestBody, string soapAction, out string body)
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.CacheControl = new System.Net.Http.Headers.CacheControlHeaderValue
            {
                NoCache = true
            };
            var content = new StringContent(requestBody);
            content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/xml")
            {
                CharSet = Encoding.UTF8.WebName
            };
            content.Headers.Add("SOAPACTION", soapAction);
            client.Timeout = TimeSpan.FromSeconds(5);
            var requestTask = client.PostAsync($"{_protocol}://{_domain}/ctl/ContentDir", content);
            requestTask.Wait();

            var response = requestTask.Result;

            var readTask = response.Content.ReadAsStringAsync();
            readTask.Wait();
            body = readTask.Result;
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

        public IEnumerable<DLNAItem> Browse(string objectId, int startingIndex, int requestedCount, string sortCriteria)
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

            var result = ParseResultBodyForDLNAStructures(body);
            return result;
        }

        public DLNAItem Info(string objectId)
        {
            var requestBody = $@"<?xml version=""1.0""?>
                <s:Envelope xmlns:s=""http://schemas.xmlsoap.org/soap/envelope/"" s:encodingStyle=""http://schemas.xmlsoap.org/soap/encoding/"">
                <s:Body>
                <u:Browse xmlns:u=""urn:schemas-upnp-org:service:ContentDirectory:1"">
                <ObjectID>{objectId}</ObjectID>
                <BrowseFlag>BrowseMetadata</BrowseFlag>
                <Filter>*</Filter>
                <StartingIndex>0</StartingIndex>
                <RequestedCount>1</RequestedCount>
                <SortCriteria></SortCriteria>
                </u:Browse>
                </s:Body>
                </s:Envelope>";

            this._request(requestBody, "urn:schemas-upnp-org:service:ContentDirectory:1#Browse", out var body);

            var result = ParseResultBodyForDLNAStructures(body);
            return result.FirstOrDefault();
        }

        public IEnumerable<DLNAItem> Search(string objectId, int startingIndex, int requestedCount, string sortCriteria, string searchCriteria)
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

            var result = ParseResultBodyForDLNAStructures(body);
            return result;
        }
    }
}
