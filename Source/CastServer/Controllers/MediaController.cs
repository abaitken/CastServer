using CastServer.MediaSources;
using CastServer.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace CastServer.Controllers
{
    [ApiController]
    [Route("api")]
    public class MediaController : ControllerBase
    {
        const int ITEM_PAGE_COUNT = 25;
        private readonly DlnaMediaSource _mediaSource;

        public MediaController()
        {
            _mediaSource = new DlnaMediaSource("http", "dnla.services.lan");
        }

        [HttpGet]
        [Route("[action]/{id}/{page?}")]
        public dynamic Browse(string id, int? page)
        {
            var result = _mediaSource.Browse(id, (page.HasValue ? page.Value : 0) * ITEM_PAGE_COUNT, ITEM_PAGE_COUNT, "+upnp:class,+dc:title");
            return new
            {
                items = result
            };
        }

        [HttpGet]
        [Route("[action]/{id}")]
        public dynamic Breadcrumb(string id)
        {
            var results = new List<DLNAItem>();

            var item = _mediaSource.Info(id);
            while(item != null)
            {
                results.Insert(0, item);
                item = _mediaSource.Info(item.parentID);
            }

            return results;
        }

        [HttpGet]
        [Route("[action]/{id}")]
        public dynamic Info(string id)
        {
            var result = _mediaSource.Info(id);
            return result;
        }

        [HttpGet]
        [Route("[action]/{id}/{criteria}/{page?}")]
        public dynamic Search(string id, string criteria, int? page)
        {
            var result = _mediaSource.Search(id, (page.HasValue ? page.Value : 0) * ITEM_PAGE_COUNT, ITEM_PAGE_COUNT, "+upnp:class,+dc:title", $@"dc:title = ""{criteria}""");
            return result;
        }

        [HttpPost]
        [Route("[action]")]
        public dynamic Playlist()
        {
            return System.Array.Empty<object>();
        }

        [HttpPost]
        [Route("[action]")]
        public dynamic Playlist([FromQuery] string id, [FromQuery] string op)
        {
            return false;
        }

        [HttpPost]
        [Route("[action]")]
        public dynamic PlaylistMove([FromQuery] string id, [FromQuery] string to)
        {
            return false;
        }

        [HttpPut]
        [Route("[action]")]
        public dynamic Cast([FromQuery] string op)
        {
            return false;
        }

        [HttpPut]
        [Route("[action]")]
        public dynamic CastVolume([FromQuery] string value)
        {
            return false;
        }

        [HttpGet]
        [Route("[action]")]
        public dynamic CastStatus()
        {
            return new
            {
                volume = new
                {
                    level = 0.5,
                    muted = 0
                }
            };
        }
    }
}
