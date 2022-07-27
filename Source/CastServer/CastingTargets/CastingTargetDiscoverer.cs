using CastServer.Model;
using Sharpcaster;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CastServer.CastingTargets
{
    public class CastingTargetDiscoverer
    {
        public async Task<IEnumerable<CastingTarget>> Discover()
        {

            var locator = new MdnsChromecastLocator();
            var responses = await locator.FindReceiversAsync();

            var results = from item in responses
                          select new CastingTarget(item);

            return results.ToList();
        }
    }
}
