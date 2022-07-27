using System;
using System.Collections.Generic;

namespace CastServer
{
    public static class EnumerableExtensions
    {
        public static int IndexOf<T>(this IList<T> list, Func<T, bool> predicate)
        {
            for (var i = 0; i < list.Count; i++)
            {
                var item = list[i];
                if (predicate(item))
                    return i;
            }

            return -1;
        }
    }
}
