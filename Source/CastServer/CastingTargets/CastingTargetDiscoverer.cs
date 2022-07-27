using CastServer.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Zeroconf;

namespace CastServer.CastingTargets
{
    public class CastingTargetDiscoverer
    {
        public async Task<IEnumerable<CastingTarget>> Discover()
        {
            var responses = await ZeroconfResolver.ResolveAsync("_googlecast._tcp.local.");

            var results = from item in responses
                          select new CastingTarget(item);

            return results.ToList();
        }
    }
}
