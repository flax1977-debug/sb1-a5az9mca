namespace VeritasAlpha.Core
{
    public sealed class SocialSummary
    {
        public string Ticker { get; set; } = string.Empty;
        public DateTime WindowStartUtc { get; set; }
        public int MessageCount { get; set; }
        public double HypeLexiconDensity { get; set; }
        public double NewAccountRatio { get; set; }
    }
}