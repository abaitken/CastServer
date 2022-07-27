using Sharpcaster.Models;

namespace CastServer.Model
{
    public class CastingTarget
    {
        private ChromecastReceiver _item;

        public CastingTarget(ChromecastReceiver item)
        {
            _item = item;
        }

        public string DisplayName { get => _item.Name; }
    }
}
