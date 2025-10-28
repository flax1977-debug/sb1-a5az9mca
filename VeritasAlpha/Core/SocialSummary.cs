using System;

namespace VeritasAlpha.Core
{
    /// <summary>
    /// Social media analysis summary for a ticker symbol
    /// </summary>
    public sealed class SocialSummary
    {
        /// <summary>
        /// Stock ticker symbol
        /// </summary>
        public string Ticker { get; set; } = string.Empty;

        /// <summary>
        /// Start of the time window for this summary (UTC)
        /// </summary>
        public DateTime WindowStartUtc { get; set; }

        /// <summary>
        /// Total number of social media messages/posts found
        /// </summary>
        public int MessageCount { get; set; }

        /// <summary>
        /// Density of hype/promotional language (0.0 to 1.0)
        /// Higher values indicate more speculative/promotional content
        /// </summary>
        public double HypeLexiconDensity { get; set; }

        /// <summary>
        /// Ratio of posts from new/recently created accounts (0.0 to 1.0)
        /// Higher values may indicate coordinated promotional activity
        /// </summary>
        public double NewAccountRatio { get; set; }
    }
}