using CastServer.Model;
using System;
using System.Threading.Tasks;

namespace CastServer
{
    public class CastingConnection
    {
        internal Task<CastingStatus> GetStatus()
        {
            return Task.FromResult(new CastingStatus()
            {
                Volume = new CastingVolume()
            });
        }

        internal Task<MediaStatus> GetMediaStatus()
        {
            return Task.FromResult(new MediaStatus());
        }

        internal void Pause()
        {
            // TODO
        }

        internal void Play()
        {
            // TODO
        }

        internal void Stop()
        {
            // TODO
        }

        internal void Next()
        {
            // TODO
        }

        internal void Previous()
        {
            // TODO
        }

        internal void Unmute()
        {
            // TODO
        }

        internal void Mute()
        {
            // TODO
        }

        internal void SeekAhead()
        {
            // TODO
        }

        internal void Rewind()
        {
            // TODO
        }

        internal void Repeat()
        {
            // TODO
        }

        internal void Shuffle()
        {
            // TODO
        }

        internal void SetVolume(double value)
        {
            // TODO
        }
    }
}
