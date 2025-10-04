using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using VeritasAlpha.Core;
using VeritasAlpha.Ingestion;

namespace VeritasAlpha.Examples
{
    /// <summary>
    /// Example of how to test the Reddit integration without full app
    /// </summary>
    public class RedditClientExample
    {
        public static async Task TestRedditIntegrationAsync()
        {
            // Set up logging
            var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            var logger = loggerFactory.CreateLogger<RedditClient>();

            // Configure Reddit client
            var config = new RedditConfig
            {
                ClientId = Environment.GetEnvironmentVariable("REDDIT_CLIENT_ID") ?? "your_client_id_here",
                ClientSecret = Environment.GetEnvironmentVariable("REDDIT_CLIENT_SECRET") ?? "your_secret_here",
                UserAgent = "VeritasAlpha/1.0",
                Subreddits = new[] { "stocks", "investing" }, // Start with fewer for testing
                SearchLimitPerSubreddit = 50 // Lower limit for testing
            };

            // Create client
            using var http = new System.Net.Http.HttpClient();
            using var client = new RedditClient(http, config, logger);

            // Test with popular tickers
            var testTickers = new[] { "AAPL", "TSLA", "GME", "AMC", "SPY" };

            foreach (var ticker in testTickers)
            {
                Console.WriteLine($"\n=== Testing {ticker} ===");
                
                try
                {
                    var summary = await client.GetRedditSummaryAsync(ticker);
                    
                    if (summary != null)
                    {
                        Console.WriteLine($"Ticker: {summary.Ticker}");
                        Console.WriteLine($"Messages: {summary.MessageCount}");
                        Console.WriteLine($"Hype Density: {summary.HypeLexiconDensity:P2}");
                        Console.WriteLine($"New Account Ratio: {summary.NewAccountRatio:P2}");
                        Console.WriteLine($"Window Start: {summary.WindowStartUtc}");
                    }
                    else
                    {
                        Console.WriteLine($"No data retrieved for {ticker}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error testing {ticker}: {ex.Message}");
                }

                // Rate limiting between tests
                await Task.Delay(TimeSpan.FromSeconds(2));
            }
        }
    }
}