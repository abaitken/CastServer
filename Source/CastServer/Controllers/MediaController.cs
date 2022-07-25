using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CastServer.Controllers
{
    [ApiController]
    [Route("api")]
    public class MediaController : ControllerBase
    {
        [HttpGet]
        [Route("[action]")]
        public dynamic Browse([FromQuery] string id, [FromQuery] int page)
        {
            return new
            {
                items = new object[0]
            };
        }

        [HttpGet]
        [Route("[action]")]
        public dynamic Info([FromQuery] string id)
        {
            return new
            {
                parentID = -1
            };
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
