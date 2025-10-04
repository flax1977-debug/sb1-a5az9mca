using System.Threading.Tasks;

namespace VeritasAlpha.Core
{
    /// <summary>
    /// Interface for social media data collection
    /// </summary>
    public interface ISocialClient
    {
        /// <summary>
        /// Gets social media summary data for the specified ticker symbol
        /// </summary>
        /// <param name="ticker">Stock ticker symbol (e.g., "AAPL")</param>
        /// <returns>Social media analysis summary or null if unavailable</returns>
        Task<SocialSummary?> GetRedditSummaryAsync(string ticker);
    }
}