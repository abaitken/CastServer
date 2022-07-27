using CastServer.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CastServer
{
    public class Playlist
    {
        // TODO : Make concurrent bag
        private readonly List<DLNAItem> _items;

        public Playlist()
        {
            _items = new List<DLNAItem>();
        }

        public IEnumerable<DLNAItem> Items { get => _items; }

        // TODO : Use a queue to add items
        internal void Add(DLNAItem item)
        {
            _items.Add(item);
        }

        internal void Remove(string id)
        {
            var index = _items.IndexOf(o => o.id.Equals(id));
            if (index == -1)
                return;
            _items.RemoveAt(index);
        }

        public void Clear()
        {
            _items.Clear();
        }

        internal void Move(string id, int to)
        {
            var index = _items.IndexOf(o => o.id.Equals(id));
            if (index == -1)
                return;
            var item = _items[index];
            _items.RemoveAt(index);

            var adjustedIndex = to > index ? to - 1 : to;
            _items.Insert(adjustedIndex, item);
        }
    }
}
