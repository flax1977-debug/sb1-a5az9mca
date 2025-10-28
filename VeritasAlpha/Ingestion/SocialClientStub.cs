using System;
using System.Threading.Tasks;
using VeritasAlpha.Core;

namespace VeritasAlpha.Ingestion
{
    /// <summary>
    /// Stub implementation of social client for testing/fallback
    /// </summary>
    public sealed class SocialClientStub : ISocialClient
    {
        public Task<SocialSummary?> GetRedditSummaryAsync(string ticker)
        {
            // Return empty data for stub implementation
            var summary = new SocialSummary
            {
                Ticker = ticker,
                WindowStartUtc = DateTime.UtcNow.AddHours(-24),
                MessageCount = 0,
                HypeLexiconDensity = 0.0,
                NewAccountRatio = 0.0
            };

            return Task.FromResult<SocialSummary?>(summary);
        }
    }
}