using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CastServer.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult NowPlaying()
        {
            return View();
        }

        public IActionResult Playlist()
        {
            return View();
        }

        public IActionResult Browse()
        {
            return View();
        }
    }
}
