using CastServer.Model;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Xml;

namespace CastServer.MediaSources
{
    internal static class DlnaDataParser
    {
        private static DLNAContainer RedefineContainer(AssociateArrayBehaviour item)
        {
            return new DLNAContainer
            {
                id = item["$"]["id"],
                parentID = item["$"]["parentID"],
                childCount = item["$"]["childCount"],
                title = item["dc:title"],
                type = item["upnp:class"],
                // TODO : Can be an array!
                albumArtURI = item["upnp:albumArtURI"]["_"].Values<string>(),
                canplay = true
            };
        }

        private static DLNAMusicItem RedefineMusic(AssociateArrayBehaviour item)
        {
            return new DLNAMusicItem
            {
                id = item["$"]["id"],
                parentID = item["$"]["parentID"],
                title = item["dc:title"],
                creator = item["dc:creator"],
                artist = item["upnp:artist"],
                album = item["upnp:album"],
                genre = item["upnp:genre"],
                res = item["res"]["_"].Values<string>(),
                type = item["upnp:class"],
                size = item["res"]["$"]["size"],
                duration = item["res"]["$"]["duration"],
                bitrate = item["res"]["$"]["bitrate"],
                sampleFrequency = item["res"]["$"]["sampleFrequency"],
                nrAudioChannels = item["res"]["$"]["nrAudioChannels"],
                protocolInfo = item["res"]["$"]["protocolInfo"],
                originalTrackNumber = item["upnp:originalTrackNumber"],
                albumArtURI = item["upnp:albumArtURI"]["_"],
                canplay = true
            };
        }

        private static DLNAUnknownItem RedefineUnknown(AssociateArrayBehaviour item)
        {
            return new DLNAUnknownItem
            {
                id = item["$"]["id"],
                parentID = item["$"]["parentID"],
                title = item["dc:title"],
                type = item["upnp:class"]
            };
        }

        private static DLNAItem RedefineItem(AssociateArrayBehaviour entity)
        {
            var classType = entity["upnp:class"].ToString();
            if (classType.Contains("folder", System.StringComparison.CurrentCultureIgnoreCase))
                return RedefineContainer(entity);

            if (classType.Contains("track", System.StringComparison.CurrentCultureIgnoreCase))
                return RedefineMusic(entity);

            return RedefineUnknown(entity);
        }

        private static IEnumerable<DLNAItem> RestructureEntities(AssociateArrayBehaviour entities)
        {
            var result = new List<DLNAItem>();

            foreach (var entity in entities)
                result.Add(RedefineItem(entity));

            return result;
        }

        public static IEnumerable<DLNAItem> FromEncodedString(string text)
        {
            var xmlString = WebUtility.HtmlDecode(text);
            return FromXmlString(xmlString);
        }

        public static IEnumerable<DLNAItem> FromXmlString(string xmlString)
        {
            var xml = new XmlDocument();
            xml.LoadXml(xmlString);

            return FromXml(xml);
        }

        public static IEnumerable<DLNAItem> FromXml(XmlDocument xml)
        {
            var data = new AssociateArrayBehaviour(xml)["DIDL-Lite"];
            var containers = RestructureEntities(data["container"]);
            var items = RestructureEntities(data["item"]);
            var result = containers.Concat(items);

            return result;
        }

        class AssociateArrayBehaviour : IEnumerable<AssociateArrayBehaviour>
        {
            private readonly IEnumerable<XmlNode> _nodes;

            public AssociateArrayBehaviour(XmlNode node)
                : this(new[] { node })
            {

            }

            public AssociateArrayBehaviour(IEnumerable<XmlNode> nodes)
            {
                _nodes = nodes;
            }

            public AssociateArrayBehaviour this[string name]
            {
                get
                {
                    if (Node is XmlAttribute)
                    {
                        var nodes = from node in _nodes
                                    where node.Name.Equals(name)
                                    select node;
                        return new AssociateArrayBehaviour(nodes);
                    }

                    if (name.Equals("$"))
                        return new AssociateArrayBehaviour(from XmlAttribute attribute in Node.Attributes
                                                           select attribute);

                    // SCOPE
                    {
                        var nodes = from node in _nodes
                                    from XmlNode child in node.ChildNodes
                                    where child.Name.Equals(name)
                                    select child;
                        return new AssociateArrayBehaviour(nodes);
                    }
                }
            }

            private XmlNode Node { get => _nodes.FirstOrDefault(); }

            public T Value<T>()
            {
                if (Node == null)
                    return default;

                var value = Node.InnerText;
                var result = Convert.ChangeType(value, typeof(T));

                return (T)result;
            }

            public IEnumerable<T> Values<T>()
            {
                // TODO : Not finished!
                return default;
            }

            public static implicit operator int(AssociateArrayBehaviour o) => o.Value<int>();
            public static implicit operator string(AssociateArrayBehaviour o) => o.ToString();

            public override string ToString()
            {
                return Node?.InnerText;
            }

            public IEnumerator<AssociateArrayBehaviour> GetEnumerator()
            {
                foreach (var node in _nodes)
                {
                    yield return new AssociateArrayBehaviour(node);
                }
            }

            IEnumerator IEnumerable.GetEnumerator()
            {
                return GetEnumerator();
            }
        }
    }
}
