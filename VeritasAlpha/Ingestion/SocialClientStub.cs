using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using VeritasAlpha.Core;

namespace VeritasAlpha.Ingestion
{
    public sealed class SocialClientStub : ISocialClient
    {
        private readonly ILogger<SocialClientStub> _log;

        public SocialClientStub(ILogger<SocialClientStub> log)
        {
            _log = log;
        }

        public Task<SocialSummary?> GetRedditSummaryAsync(string ticker)
        {
            _log.LogInformation("SocialClientStub: Returning empty summary for {Ticker}", ticker);
            
            return Task.FromResult<SocialSummary?>(new SocialSummary
            {
                Ticker = ticker,
                WindowStartUtc = DateTime.UtcNow.AddHours(-24),
                MessageCount = 0,
                HypeLexiconDensity = 0.0,
                NewAccountRatio = 0.0
            });
        }
    }
}