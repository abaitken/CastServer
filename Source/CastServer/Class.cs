using Microsoft.AspNetCore.Mvc.Rendering;

namespace CastServer
{
    public static class CustomHtmlHelpers
    {
        public static string IsNavigationActive(this IHtmlHelper htmlHelper, string matchController, string matchAction, string cssClass)
        {
            var controller = htmlHelper.ViewContext.RouteData.Values["controller"] as string;
            var action = htmlHelper.ViewContext.RouteData.Values["action"] as string;
            
            return matchController.Equals(controller) && matchAction.Equals(action) ? cssClass : string.Empty;
        }
    }
}
