using System.Collections.Generic;

namespace CastServer.Model
{
    public abstract class DLNAItem
    {
        public string id { get; init; }
        public string parentID { get; init; }
        public string title { get; init; }
        public string type { get; init; }
        public bool canplay { get; init; }

    }

    public class DLNAContainer : DLNAItem
    {
        public string childCount { get; init; }
        public IEnumerable<string> albumArtURI { get; init; }
    }

    public class DLNAMusicItem : DLNAItem
    {
        public string creator { get; init; }
        public string artist { get; init; }
        public string album { get; init; }
        public string genre { get; init; }
        public IEnumerable<string> res { get; init; }
        public string size { get; init; }
        public string duration { get; init; }
        public string bitrate { get; init; }
        public string sampleFrequency { get; init; }
        public string nrAudioChannels { get; init; }
        public string protocolInfo { get; init; }
        public string originalTrackNumber { get; init; }
        public string albumArtURI { get; init; }
    }

    public class DLNAUnknownItem : DLNAItem
    {
    }
}
