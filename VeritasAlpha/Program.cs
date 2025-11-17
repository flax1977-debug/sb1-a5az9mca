using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VeritasAlpha.Core;
using VeritasAlpha.Ingestion;

namespace VeritasAlpha
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("VeritasAlpha Reddit Integration Test");
            Console.WriteLine("====================================");

            // Create host with services
            var host = Host.CreateDefaultBuilder()
                .ConfigureServices(services =>
                {
                    services.AddLogging(builder =>
                    {
                        builder.AddConsole();
                        builder.SetMinimumLevel(LogLevel.Information);
                    });

                    // Add Reddit client (will auto-detect if credentials exist)
                    services.AddRedditClient();
                })
                .Build();

            // Get the social client
            var socialClient = host.Services.GetRequiredService<ISocialClient>();

            // Test with a popular ticker
            var ticker = "AAPL";
            Console.WriteLine($"\nTesting Reddit integration for {ticker}...");

            try
            {
                var summary = await socialClient.GetRedditSummaryAsync(ticker);

                if (summary != null)
                {
                    Console.WriteLine($"\nResults for {summary.Ticker}:");
                    Console.WriteLine($"  Messages: {summary.MessageCount}");
                    Console.WriteLine($"  Hype Density: {summary.HypeLexiconDensity:P2}");
                    Console.WriteLine($"  New Account Ratio: {summary.NewAccountRatio:P2}");
                    Console.WriteLine($"  Window Start: {summary.WindowStartUtc:yyyy-MM-dd HH:mm:ss} UTC");
                }
                else
                {
                    Console.WriteLine("Failed to get Reddit summary");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }

            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }
}