using System;
using System.Collections.Generic;

namespace VeritasAlpha.Models
{
    /// <summary>
    /// Stock ticker information and analysis data
    /// </summary>
    public sealed class StockInfo
    {
        public string Ticker { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Sector { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
        public decimal PreviousClose { get; set; }
        public decimal DayChange { get; set; }
        public decimal DayChangePercent { get; set; }
        public decimal MarketCap { get; set; }
        public decimal Volume { get; set; }
        public decimal AverageVolume { get; set; }
        public decimal PeRatio { get; set; }
        public decimal DividendYield { get; set; }
        public decimal FiftyTwoWeekHigh { get; set; }
        public decimal FiftyTwoWeekLow { get; set; }
        public DateTime LastUpdated { get; set; }
        
        // Technical indicators
        public decimal? RSI { get; set; }
        public decimal? MACD { get; set; }
        public decimal? BollingerUpper { get; set; }
        public decimal? BollingerLower { get; set; }
        
        public List<PriceHistoryPoint> PriceHistory { get; set; } = new();
    }

    /// <summary>
    /// Historical price data point
    /// </summary>
    public sealed class PriceHistoryPoint
    {
        public DateTime Date { get; set; }
        public decimal Open { get; set; }
        public decimal High { get; set; }
        public decimal Low { get; set; }
        public decimal Close { get; set; }
        public decimal Volume { get; set; }
    }

    /// <summary>
    /// Stock analysis score and risk assessment
    /// </summary>
    public sealed class StockScore
    {
        public string Ticker { get; set; } = string.Empty;
        public decimal OverallScore { get; set; }
        public decimal FundamentalScore { get; set; }
        public decimal TechnicalScore { get; set; }
        public decimal SocialSentimentScore { get; set; }
        public decimal ManipulationRisk { get; set; }
        public decimal NarrativeMomentum { get; set; }
        public string RiskLevel { get; set; } = "Unknown";
        public string Recommendation { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        
        public bool HasFilings { get; set; }
        public bool HasMarketBars { get; set; }
        public bool HasSocial { get; set; }
    }

    /// <summary>
    /// News article or financial filing
    /// </summary>
    public sealed class NewsItem
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public DateTime PublishedDate { get; set; }
        public List<string> RelatedTickers { get; set; } = new();
        public string Sentiment { get; set; } = "Neutral"; // Positive, Negative, Neutral
        public decimal SentimentScore { get; set; }
    }

    /// <summary>
    /// Watchlist for tracking stocks
    /// </summary>
    public sealed class Watchlist
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Tickers { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDefault { get; set; }
    }

    /// <summary>
    /// User portfolio position
    /// </summary>
    public sealed class PortfolioPosition
    {
        public string Id { get; set; } = string.Empty;
        public string Ticker { get; set; } = string.Empty;
        public decimal Shares { get; set; }
        public decimal AverageCost { get; set; }
        public decimal CurrentValue { get; set; }
        public decimal UnrealizedGainLoss { get; set; }
        public decimal UnrealizedGainLossPercent { get; set; }
        public DateTime FirstPurchased { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    /// <summary>
    /// Application settings
    /// </summary>
    public sealed class AppSettings
    {
        public bool EnableSocialAnalysis { get; set; } = true;
        public bool EnableRealTimeData { get; set; } = true;
        public int RefreshIntervalSeconds { get; set; } = 300; // 5 minutes
        public string DefaultWatchlistId { get; set; } = string.Empty;
        public List<string> FavoriteTickers { get; set; } = new();
        public string Theme { get; set; } = "Light";
        public bool ShowNotifications { get; set; } = true;
        public decimal AlertThresholdPercent { get; set; } = 5.0m;
    }
}