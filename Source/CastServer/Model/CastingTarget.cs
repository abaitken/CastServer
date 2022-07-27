using Zeroconf;

namespace CastServer.Model
{
    public class CastingTarget
    {
        private IZeroconfHost _item;

        public CastingTarget(IZeroconfHost item)
        {
            _item = item;
        }

        public string DisplayName { get => _item.DisplayName; }
    }
}
