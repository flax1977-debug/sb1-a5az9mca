// Example usage of VeritasAlpha Reddit Integration
// This file demonstrates how to use the Reddit client in your application

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VeritasAlpha.Core;
using VeritasAlpha.Ingestion;

namespace VeritasAlpha.Examples
{
    public class RedditIntegrationExample
    {
        public static async Task RunExample()
        {
            // 1. Setup dependency injection
            var services = new ServiceCollection();
            
            // Add logging
            services.AddLogging(builder =>
            {
                builder.AddConsole();
                builder.SetMinimumLevel(LogLevel.Information);
            });

            // Add Reddit client (auto-detects credentials)
            services.AddRedditClient();

            var serviceProvider = services.BuildServiceProvider();

            // 2. Get the social client
            var socialClient = serviceProvider.GetRequiredService<ISocialClient>();

            // 3. Analyze multiple tickers
            var tickers = new[] { "AAPL", "TSLA", "GME", "NVDA" };

            foreach (var ticker in tickers)
            {
                Console.WriteLine($"\nAnalyzing {ticker}...");
                
                try
                {
                    var summary = await socialClient.GetRedditSummaryAsync(ticker);
                    
                    if (summary != null)
                    {
                        Console.WriteLine($"  📊 Messages: {summary.MessageCount}");
                        Console.WriteLine($"  🚀 Hype Density: {summary.HypeLexiconDensity:P1}");
                        Console.WriteLine($"  👤 New Account Ratio: {summary.NewAccountRatio:P1}");
                        
                        // Determine sentiment
                        var sentiment = DetermineSentiment(summary);
                        Console.WriteLine($"  💭 Sentiment: {sentiment}");
                    }
                    else
                    {
                        Console.WriteLine("  ❌ Failed to get data");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ❌ Error: {ex.Message}");
                }
            }
        }

        private static string DetermineSentiment(SocialSummary summary)
        {
            if (summary.MessageCount == 0) return "No Data";
            
            var hypeScore = summary.HypeLexiconDensity;
            var newAccountRisk = summary.NewAccountRatio;
            
            if (hypeScore > 0.3 && newAccountRisk > 0.5)
                return "🚨 High Risk (High Hype + Many New Accounts)";
            else if (hypeScore > 0.2)
                return "🔥 Bullish (High Hype)";
            else if (newAccountRisk > 0.4)
                return "⚠️ Suspicious (Many New Accounts)";
            else if (summary.MessageCount > 50)
                return "📈 Active Discussion";
            else
                return "📉 Low Activity";
        }
    }

    // Example of manual Reddit client configuration
    public class ManualRedditExample
    {
        public static async Task RunManualExample()
        {
            // Manual configuration (useful for testing)
            var config = new RedditConfig
            {
                ClientId = "your_client_id_here",
                ClientSecret = "your_secret_here",
                UserAgent = "VeritasAlpha/1.0",
                Subreddits = new[] { "stocks", "investing", "wallstreetbets" },
                SearchLimitPerSubreddit = 100
            };

            using var httpClient = new HttpClient();
            using var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            var logger = loggerFactory.CreateLogger<RedditClient>();

            var redditClient = new RedditClient(httpClient, config, logger);

            try
            {
                var summary = await redditClient.GetRedditSummaryAsync("AAPL");
                
                if (summary != null)
                {
                    Console.WriteLine($"Manual test successful!");
                    Console.WriteLine($"Messages: {summary.MessageCount}");
                    Console.WriteLine($"Hype: {summary.HypeLexiconDensity:P2}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Manual test failed: {ex.Message}");
            }
        }
    }
}