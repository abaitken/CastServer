using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CastServer
{
    internal class CastingService : BackgroundService
    {
        private readonly TimeSpan _queueDelay;
        private readonly ILogger<CastingService> _logger;
        private CancellationTokenSource _delayCancellation;

        public CastingService(ILogger<CastingService> logger)
        {
            _queueDelay = TimeSpan.FromMinutes(5);
            _logger = logger;
            //_playlist.ProjectAdded += _playlist_ItemsAdded;
        }

        private void _playlist_ItemsAdded(object sender, EventArgs e)
        {
            Task.Run(() => _delayCancellation?.Cancel());
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _delayCancellation = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            while (!stoppingToken.IsCancellationRequested)
            {
                // TODO
                var token = _delayCancellation.Token;
                try
                {
                    await Task.Delay(_queueDelay, token);
                }
                catch (TaskCanceledException)
                {
                }
                if (!_delayCancellation.TryReset())
                    _delayCancellation = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            }
        }
    }
}
