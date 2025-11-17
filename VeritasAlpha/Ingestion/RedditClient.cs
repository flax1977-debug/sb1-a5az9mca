// =======================
// Reddit Integration for Veritas Alpha
// =======================
// Replace SocialClientStub with this implementation
// Requires Reddit app credentials: https://www.reddit.com/prefs/apps
// =======================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using VeritasAlpha.Core;

namespace VeritasAlpha.Ingestion
{
    // =======================
    // Configuration Model
    // =======================
    public sealed class RedditConfig
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string UserAgent { get; set; } = "VeritasAlpha/1.0";
        public string[] Subreddits { get; set; } = new[] { "stocks", "investing", "wallstreetbets" };
        public int SearchLimitPerSubreddit { get; set; } = 100;
    }

    // =======================
    // Reddit API Models
    // =======================
    internal sealed class RedditAuthResponse
    {
        public string access_token { get; set; } = string.Empty;
        public string token_type { get; set; } = string.Empty;
        public int expires_in { get; set; }
        public string scope { get; set; } = string.Empty;
    }

    internal sealed class RedditPost
    {
        public string Id { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Selftext { get; set; } = string.Empty;
        public long Created { get; set; }
        public int Score { get; set; }
        public int NumComments { get; set; }
        public string Subreddit { get; set; } = string.Empty;
    }

    internal sealed class RedditUser
    {
        public string Name { get; set; } = string.Empty;
        public long Created { get; set; }
        public int LinkKarma { get; set; }
        public int CommentKarma { get; set; }
    }

    // =======================
    // Reddit Client Implementation
    // =======================
    public sealed class RedditClient : ISocialClient, IDisposable
    {
        private readonly HttpClient _http;
        private readonly RedditConfig _config;
        private readonly ILogger<RedditClient> _log;
        private readonly HashSet<string> _hypeTerms;
        
        private string? _accessToken;
        private DateTime _tokenExpiry = DateTime.MinValue;
        private readonly SemaphoreSlim _authLock = new(1, 1);

        public RedditClient(HttpClient http, RedditConfig config, ILogger<RedditClient> log)
        {
            _http = http;
            _config = config;
            _log = log;

            // Hype language detection terms
            _hypeTerms = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "moon", "🚀", "rocket", "lambo", "diamond hands", "💎",
                "squeeze", "short squeeze", "ape", "hodl", "yolo", 
                "tendies", "to the moon", "10x", "100x", "moonshot",
                "🌙", "🦍", "pump", "💰", "🤑"
            };
        }

        // =======================
        // Main Interface Method
        // =======================
        public async Task<SocialSummary?> GetRedditSummaryAsync(string ticker)
        {
            try
            {
                _log.LogInformation("Fetching Reddit data for {Ticker}", ticker);

                // Authenticate first
                await EnsureAuthenticatedAsync();

                // Search across configured subreddits
                var mentions = new List<RedditPost>();
                foreach (var subreddit in _config.Subreddits)
                {
                    try
                    {
                        var posts = await SearchSubredditAsync(subreddit, ticker);
                        mentions.AddRange(posts);
                        
                        // Rate limiting (60 requests/minute for OAuth)
                        await Task.Delay(TimeSpan.FromSeconds(1));
                    }
                    catch (Exception ex)
                    {
                        _log.LogError(ex, "Error searching r/{Subreddit} for {Ticker}", subreddit, ticker);
                    }
                }

                if (mentions.Count == 0)
                {
                    _log.LogInformation("No Reddit mentions found for {Ticker}", ticker);
                    return new SocialSummary
                    {
                        Ticker = ticker,
                        WindowStartUtc = DateTime.UtcNow.AddHours(-24),
                        MessageCount = 0,
                        HypeLexiconDensity = 0.0,
                        NewAccountRatio = 0.0
                    };
                }

                // Fetch author details for account age analysis
                var authorDetails = await GetAuthorDetailsAsync(mentions.Select(m => m.Author).Distinct().Take(50));

                // Calculate metrics
                var hypeCount = mentions.Count(m => ContainsHypeLanguage(m.Title + " " + m.Selftext));
                var hypeDensity = (double)hypeCount / mentions.Count;

                var newAccountCount = authorDetails.Count(a => IsNewAccount(a, dayThreshold: 90));
                var newAccountRatio = authorDetails.Count > 0 ? (double)newAccountCount / authorDetails.Count : 0.0;

                _log.LogInformation("Reddit summary for {Ticker}: {Count} mentions, {Hype:P0} hype, {New:P0} new accounts",
                    ticker, mentions.Count, hypeDensity, newAccountRatio);

                return new SocialSummary
                {
                    Ticker = ticker,
                    WindowStartUtc = DateTime.UtcNow.AddHours(-24),
                    MessageCount = mentions.Count,
                    HypeLexiconDensity = hypeDensity,
                    NewAccountRatio = newAccountRatio
                };
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Failed to fetch Reddit data for {Ticker}", ticker);
                return null;
            }
        }

        // =======================
        // OAuth2 Authentication
        // =======================
        private async Task EnsureAuthenticatedAsync()
        {
            if (_accessToken != null && DateTime.UtcNow < _tokenExpiry)
                return;

            await _authLock.WaitAsync();
            try
            {
                // Double-check after acquiring lock
                if (_accessToken != null && DateTime.UtcNow < _tokenExpiry)
                    return;

                _log.LogInformation("Authenticating with Reddit API");

                var authString = Convert.ToBase64String(
                    Encoding.UTF8.GetBytes($"{_config.ClientId}:{_config.ClientSecret}")
                );

                var request = new HttpRequestMessage(HttpMethod.Post, "https://www.reddit.com/api/v1/access_token");
                request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authString);
                request.Headers.UserAgent.ParseAdd(_config.UserAgent);
                request.Content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials")
                });

                var response = await _http.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var authResp = JsonSerializer.Deserialize<RedditAuthResponse>(json);

                if (authResp == null || string.IsNullOrEmpty(authResp.access_token))
                    throw new InvalidOperationException("Failed to get access token from Reddit");

                _accessToken = authResp.access_token;
                _tokenExpiry = DateTime.UtcNow.AddSeconds(authResp.expires_in - 60); // 60s buffer

                _log.LogInformation("Reddit authentication successful, token expires at {Expiry}", _tokenExpiry);
            }
            finally
            {
                _authLock.Release();
            }
        }

        // =======================
        // Search Subreddit
        // =======================
        private async Task<List<RedditPost>> SearchSubredditAsync(string subreddit, string ticker)
        {
            var posts = new List<RedditPost>();

            // Search query: ticker symbol (with $ prefix common on Reddit)
            var query = $"${ticker} OR {ticker}";
            var url = $"https://oauth.reddit.com/r/{subreddit}/search?q={Uri.EscapeDataString(query)}&restrict_sr=1&sort=new&t=day&limit={_config.SearchLimitPerSubreddit}";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
            request.Headers.UserAgent.ParseAdd(_config.UserAgent);

            var response = await _http.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                _log.LogWarning("Reddit search failed for r/{Subreddit}: {Status}", subreddit, response.StatusCode);
                return posts;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("data", out var data) ||
                !data.TryGetProperty("children", out var children))
            {
                return posts;
            }

            foreach (var child in children.EnumerateArray())
            {
                if (!child.TryGetProperty("data", out var postData))
                    continue;

                var post = new RedditPost
                {
                    Id = postData.GetProperty("id").GetString() ?? "",
                    Author = postData.GetProperty("author").GetString() ?? "",
                    Title = postData.GetProperty("title").GetString() ?? "",
                    Selftext = postData.TryGetProperty("selftext", out var st) ? st.GetString() ?? "" : "",
                    Created = postData.GetProperty("created_utc").GetInt64(),
                    Score = postData.GetProperty("score").GetInt32(),
                    NumComments = postData.GetProperty("num_comments").GetInt32(),
                    Subreddit = subreddit
                };

                // Verify ticker is actually mentioned (Reddit search can be loose)
                var content = (post.Title + " " + post.Selftext).ToUpperInvariant();
                if (content.Contains(ticker.ToUpperInvariant()) || content.Contains($"${ticker.ToUpperInvariant()}"))
                {
                    posts.Add(post);
                }
            }

            _log.LogInformation("Found {Count} posts mentioning {Ticker} in r/{Subreddit}", 
                posts.Count, ticker, subreddit);

            return posts;
        }

        // =======================
        // Get Author Details
        // =======================
        private async Task<List<RedditUser>> GetAuthorDetailsAsync(IEnumerable<string> authors)
        {
            var users = new List<RedditUser>();

            foreach (var author in authors)
            {
                try
                {
                    // Skip deleted/suspended accounts
                    if (author.StartsWith("[deleted]", StringComparison.OrdinalIgnoreCase) ||
                        author.StartsWith("[removed]", StringComparison.OrdinalIgnoreCase))
                        continue;

                    var url = $"https://oauth.reddit.com/user/{author}/about";
                    var request = new HttpRequestMessage(HttpMethod.Get, url);
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
                    request.Headers.UserAgent.ParseAdd(_config.UserAgent);

                    var response = await _http.SendAsync(request);
                    if (!response.IsSuccessStatusCode)
                    {
                        _log.LogWarning("Failed to get details for u/{Author}: {Status}", author, response.StatusCode);
                        continue;
                    }

                    var json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);

                    if (!doc.RootElement.TryGetProperty("data", out var data))
                        continue;

                    users.Add(new RedditUser
                    {
                        Name = author,
                        Created = data.GetProperty("created_utc").GetInt64(),
                        LinkKarma = data.TryGetProperty("link_karma", out var lk) ? lk.GetInt32() : 0,
                        CommentKarma = data.TryGetProperty("comment_karma", out var ck) ? ck.GetInt32() : 0
                    });

                    // Rate limiting (60 req/min)
                    await Task.Delay(TimeSpan.FromSeconds(1));
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "Error fetching details for u/{Author}", author);
                }
            }

            return users;
        }

        // =======================
        // Analysis Helpers
        // =======================
        private bool ContainsHypeLanguage(string text)
        {
            var lower = text.ToLowerInvariant();
            return _hypeTerms.Any(term => lower.Contains(term.ToLowerInvariant()));
        }

        private bool IsNewAccount(RedditUser user, int dayThreshold)
        {
            var accountAge = DateTime.UtcNow - DateTimeOffset.FromUnixTimeSeconds(user.Created);
            return accountAge.TotalDays < dayThreshold;
        }

        public void Dispose()
        {
            _authLock?.Dispose();
        }
    }

    // =======================
    // Factory/Configuration Helper
    // =======================
    public static class RedditServiceExtensions
    {
        public static IServiceCollection AddRedditClient(this IServiceCollection services)
        {
            // Get config from environment variables
            var clientId = Environment.GetEnvironmentVariable("REDDIT_CLIENT_ID");
            var clientSecret = Environment.GetEnvironmentVariable("REDDIT_CLIENT_SECRET");
            
            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                // Fall back to stub if credentials not configured
                services.AddSingleton<ISocialClient, SocialClientStub>();
                return services;
            }

            var config = new RedditConfig
            {
                ClientId = clientId,
                ClientSecret = clientSecret,
                UserAgent = "VeritasAlpha/1.0",
                Subreddits = (Environment.GetEnvironmentVariable("REDDIT_SUBREDDITS") ?? "stocks,investing")
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            };

            services.AddSingleton(config);
            services.AddHttpClient<ISocialClient, RedditClient>();

            return services;
        }
    }
}