using CastServer.CastingTargets;
using CastServer.MediaSources;
using CastServer.Model;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CastServer.Controllers
{
    [ApiController]
    [Route("api")]
    public class MediaController : ControllerBase
    {
        const int ITEM_PAGE_COUNT = 25;
        private readonly DlnaMediaSource _mediaSource;
        private readonly Playlist _playlist;
        private readonly CastingConnection _castingConnection;

        public MediaController(Playlist playlist, CastingConnection castingConnection)
        {
            _mediaSource = new DlnaMediaSource("http", "dnla.services.lan");
            _playlist = playlist;
            _castingConnection = castingConnection;
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<dynamic> Discover()
        {
            var discoverer = new CastingTargetDiscoverer();
            var result = await discoverer.Discover();
            return result;
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

        [HttpGet]
        [Route("[action]")]
        public dynamic Playlist()
        {
            return _playlist.Items;
        }

        [HttpPost]
        [Route("Playlist/{id}/Add")]
        public dynamic PlaylistAdd(string id)
        {
            _playlist.Add(_mediaSource.Info(id));
            return true;
        }

        [HttpPost]
        [Route("Playlist/{id}/Remove")]
        public dynamic PlaylistRemove(string id)
        {
            _playlist.Remove(id);
            return true;
        }

        [HttpPost]
        [Route("Playlist/Clear")]
        public dynamic PlaylistClear()
        {
            _playlist.Clear();
            return true;
        }

        [HttpPost]
        [Route("Playlist/{id}/Move/{to}")]
        public dynamic PlaylistMove(string id, int to)
        {
            _playlist.Move(id, to);
            return true;
        }

        [HttpGet]
        [Route("Cast/Status")]
        public async Task<dynamic> CastStatus()
        {
            var status = await _castingConnection.GetStatus();
            return status;
        }

        [HttpGet]
        [Route("Cast/MediaStatus")]
        public async Task<dynamic> CastMediaStatus()
        {
            var status = await _castingConnection.GetMediaStatus();
            return status;
        }

        [HttpPut]
        [Route("Cast/Pause")]
        public dynamic CastPause()
        {
            _castingConnection.Pause();
            return true;
        }

        [HttpPut]
        [Route("Cast/Play")]
        public dynamic CastPlay()
        {
            _castingConnection.Play();
            return true;
        }

        [HttpPut]
        [Route("Cast/Stop")]
        public dynamic CastStop()
        {
            _castingConnection.Stop();
            return true;
        }

        [HttpPut]
        [Route("Cast/Next")]
        public dynamic CastNext()
        {
            _castingConnection.Next();
            return true;
        }

        [HttpPut]
        [Route("Cast/Previous")]
        public dynamic CastPrevious()
        {
            _castingConnection.Previous();
            return true;
        }

        [HttpPut]
        [Route("Cast/Rewind")]
        public dynamic CastRewind()
        {
            _castingConnection.Rewind();
            return true;
        }

        [HttpPut]
        [Route("Cast/SeekAhead")]
        public dynamic CastSeekAhead()
        {
            _castingConnection.SeekAhead();
            return true;
        }

        [HttpPut]
        [Route("Cast/Mute")]
        public dynamic CastMute()
        {
            _castingConnection.Mute();
            return true;
        }

        [HttpPut]
        [Route("Cast/Unmute")]
        public dynamic CastUnmute()
        {
            _castingConnection.Unmute();
            return true;
        }

        [HttpPut]
        [Route("Cast/Repeat")]
        public dynamic CastRepeat()
        {
            _castingConnection.Repeat();
            return true;
        }

        [HttpPut]
        [Route("Cast/Shuffle")]
        public dynamic CastShuffle()
        {
            _castingConnection.Shuffle();
            return true;
        }

        [HttpPut]
        [Route("Cast/Volume/{value}")]
        public dynamic CastVolume(double value)
        {
            _castingConnection.SetVolume(value);
            return true;
        }

    }
}
