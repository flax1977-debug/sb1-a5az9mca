# Reddit Integration Setup Guide

## Overview
This Reddit client integration replaces the `SocialClientStub` with a real Reddit API implementation that analyzes social sentiment for stock tickers.

## Features
- **OAuth2 Authentication** with Reddit API
- **Multi-subreddit Search** across stocks, investing, wallstreetbets
- **Hype Language Detection** using financial meme terms
- **Account Age Analysis** to detect coordinated promotion
- **Rate Limiting** compliance (60 requests/minute)
- **Fallback to Stub** if credentials not configured

## Setup Instructions

### 1. Create Reddit Application
1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "create app" or "create another app"
3. Fill in the form:
   - **Name**: `VeritasAlpha`
   - **App type**: `script`
   - **Description**: `Personal stock research tool`
   - **Redirect URI**: `http://localhost`
4. Click "create app"
5. Note your **Client ID** (under the app name) and **Secret**

### 2. Set Environment Variables

#### Windows PowerShell:
```powershell
$env:REDDIT_CLIENT_ID = "your_client_id_here"
$env:REDDIT_CLIENT_SECRET = "your_secret_here"
$env:REDDIT_SUBREDDITS = "stocks,investing,wallstreetbets"
```

#### Windows Command Prompt:
```cmd
set REDDIT_CLIENT_ID=your_client_id_here
set REDDIT_CLIENT_SECRET=your_secret_here
set REDDIT_SUBREDDITS=stocks,investing,wallstreetbets
```

#### Permanent Setup (Windows):
1. Open System Properties → Environment Variables
2. Add new user variables:
   - `REDDIT_CLIENT_ID` = your client ID
   - `REDDIT_CLIENT_SECRET` = your secret
   - `REDDIT_SUBREDDITS` = stocks,investing,wallstreetbets

### 3. Update Application Code

In your `App.xaml.cs`, replace:
```csharp
services.AddSingleton<ISocialClient, SocialClientStub>();
```

With:
```csharp
services.AddRedditClient(); // Auto-detects credentials, falls back to stub
```

### 4. Test the Integration

Run the application and check:
1. **Logs** for "Reddit authentication successful"
2. **Database** for non-zero social data:
   ```sql
   SELECT Ticker, MessageCount, HypeLexiconDensity, NewAccountRatio 
   FROM SocialSummaries 
   WHERE MessageCount > 0
   ORDER BY WindowStartUtc DESC 
   LIMIT 10;
   ```

## How It Works

### Data Collection
- Searches configured subreddits for ticker mentions
- Looks for both `AAPL` and `$AAPL` format
- Collects posts from last 24 hours
- Fetches author account details for analysis

### Metrics Calculated
- **Message Count**: Total mentions found
- **Hype Lexicon Density**: % of posts with promotional language
- **New Account Ratio**: % of posts from accounts <90 days old

### Hype Terms Detected
🚀 moon, rocket, lambo, diamond hands, squeeze, ape, hodl, yolo, tendies, 10x, 100x, moonshot, pump 💎🌙🦍💰🤑

## Rate Limiting
- Reddit OAuth allows 60 requests/minute
- Code includes 1-second delays between requests
- With 3 subreddits: ~3 minutes per ticker scan
- Author details: additional 1 second per unique author

## Troubleshooting

### "401 Unauthorized"
- Check client ID and secret are correct
- Ensure no extra spaces in environment variables
- Verify app type is set to "script"

### "403 Forbidden"
- Reddit may be rate limiting
- Wait 1 minute and retry
- Check if user agent string is blocked

### MessageCount always 0
- Ticker may not be discussed on Reddit
- Try popular tickers: AAPL, TSLA, GME, AMC
- Check Reddit search manually
- Verify subreddit names are correct

### "Too Many Requests"
- Increase delays in code (from 1s to 2s)
- Reduce SearchLimitPerSubreddit

## Configuration Options

```csharp
var config = new RedditConfig
{
    ClientId = "your_id",
    ClientSecret = "your_secret",
    UserAgent = "VeritasAlpha/1.0",
    Subreddits = new[] { "stocks", "investing", "SecurityAnalysis" },
    SearchLimitPerSubreddit = 100
};
```

## Database Validation

After implementation, these queries should show real data:

```sql
-- Should show non-zero message counts
SELECT * FROM SocialSummaries WHERE MessageCount > 0;

-- Should show scores with social data
SELECT * FROM Scores WHERE HasSocial = 1;

-- Should see actual risk scores
SELECT Ticker, Score, ManipulationRisk, NarrativeMomentum
FROM Scores WHERE Score > 0;
```

## Performance Notes
- First run may take longer (authentication + initial requests)
- Subsequent runs use cached authentication token
- Consider running social scans less frequently (hourly vs real-time)
- Popular tickers will have more data than obscure ones