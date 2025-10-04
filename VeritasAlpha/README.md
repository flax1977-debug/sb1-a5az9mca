# VeritasAlpha Reddit Integration

This project implements Reddit integration for VeritasAlpha, a stock research tool that analyzes social media sentiment.

## Features

- **Reddit API Integration**: Fetches posts from configured subreddits
- **Sentiment Analysis**: Detects hype language and calculates sentiment metrics
- **Account Age Analysis**: Identifies new accounts to detect potential manipulation
- **Automatic Fallback**: Uses stub implementation if Reddit credentials are not configured

## Setup Instructions

### 1. Create Reddit App

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "create app" or "create another app"
3. Fill in:
   - **Name**: "VeritasAlpha"
   - **App type**: "script"
   - **Description**: "Personal stock research tool"
   - **Redirect URI**: "http://localhost"
4. Click "create app"
5. Note your **Client ID** (under the app name) and **Secret**

### 2. Set Environment Variables

#### Windows PowerShell:
```powershell
$env:REDDIT_CLIENT_ID = "your_client_id_here"
$env:REDDIT_CLIENT_SECRET = "your_secret_here"
$env:REDDIT_SUBREDDITS = "stocks,investing,wallstreetbets"
```

#### Windows (Permanent):
1. Open System Properties > Environment Variables
2. Add the variables to User or System variables

#### Linux/macOS:
```bash
export REDDIT_CLIENT_ID="your_client_id_here"
export REDDIT_CLIENT_SECRET="your_secret_here"
export REDDIT_SUBREDDITS="stocks,investing,wallstreetbets"
```

### 3. Build and Run

```bash
cd VeritasAlpha
dotnet build
dotnet run
```

## Configuration

The Reddit client automatically detects if credentials are available:

- **With credentials**: Uses real Reddit API
- **Without credentials**: Falls back to stub implementation (returns empty data)

### Environment Variables

- `REDDIT_CLIENT_ID`: Your Reddit app client ID
- `REDDIT_CLIENT_SECRET`: Your Reddit app secret
- `REDDIT_SUBREDDITS`: Comma-separated list of subreddits to monitor (default: "stocks,investing")

## Usage

```csharp
// Get Reddit summary for a ticker
var socialClient = serviceProvider.GetRequiredService<ISocialClient>();
var summary = await socialClient.GetRedditSummaryAsync("AAPL");

Console.WriteLine($"Messages: {summary.MessageCount}");
Console.WriteLine($"Hype Density: {summary.HypeLexiconDensity:P2}");
Console.WriteLine($"New Account Ratio: {summary.NewAccountRatio:P2}");
```

## Rate Limits

- Reddit OAuth: 60 requests/minute
- The implementation includes 1-second delays between requests
- With 3 subreddits, expect ~3 minutes per ticker scan

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Check client ID and secret are correct
- Ensure no extra spaces in environment variables

**403 Forbidden**
- Reddit may be rate limiting - wait 1 minute and retry
- User agent string might be blocked - change UserAgent in config

**MessageCount always 0**
- Ticker may not be discussed on Reddit - try AAPL, TSLA, GME, etc.
- Search might be too restrictive - check Reddit manually

**Too Many Requests**
- Increase delays between requests (from 1s to 2s in code)

## Project Structure

```
VeritasAlpha/
├── Core/
│   ├── ISocialClient.cs          # Social client interface
│   └── SocialSummary.cs          # Data model for social metrics
├── Ingestion/
│   ├── RedditClient.cs           # Main Reddit implementation
│   └── SocialClientStub.cs       # Fallback stub implementation
├── App/
│   ├── App.xaml                  # WPF application definition
│   └── App.xaml.cs               # Service registration
├── Program.cs                    # Test program
├── VeritasAlpha.csproj           # Project file
└── README.md                     # This file
```

## Testing

Run the test program to verify integration:

```bash
dotnet run
```

This will test the Reddit integration with AAPL and display the results.