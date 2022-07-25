using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System;

namespace CastServer
{
    class App
    {
        public void Run(string[] args)
        {
            var hostBuilder = Host.CreateDefaultBuilder(Array.Empty<string>())
                    .ConfigureWebHostDefaults(webBuilder =>
                    {
                        webBuilder.UseStartup((context) => new Startup(context.Configuration));
                    });
            var host = hostBuilder.Build();
            host.Run();
        }
    }
}
