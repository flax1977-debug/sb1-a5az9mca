import { RedditConfig, RedditAuthResponse, RedditPost, RedditUser, SocialSentiment } from '../types/Reddit';

export class RedditClient {
  private config: RedditConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  // Hype language detection terms for shopping/retail context
  private readonly hypeTerms = new Set([
    'amazing', 'incredible', 'unbelievable', 'steal', 'deal', 'bargain',
    'must have', 'love it', 'obsessed', 'game changer', 'life changing',
    'worth every penny', 'best purchase', 'highly recommend', 'amazing deal',
    'unbeatable price', 'incredible value', 'fantastic', 'outstanding',
    'excellent', 'perfect', 'awesome', 'brilliant', 'superb', 'terrific',
    'fabulous', 'wonderful', 'marvelous', 'splendid', 'magnificent',
    'extraordinary', 'phenomenal', 'exceptional', 'remarkable', 'impressive'
  ]);

  constructor(config: RedditConfig) {
    this.config = config;
  }

  async getSocialSentimentAsync(product: string, retailer?: string): Promise<SocialSentiment | null> {
    try {
      console.log(`Fetching Reddit data for ${product}${retailer ? ` at ${retailer}` : ''}`);

      // Authenticate first
      await this.ensureAuthenticated();

      // Search across configured subreddits
      const mentions = new List<RedditPost>();
      for (const subreddit of this.config.subreddits) {
        try {
          const posts = await this.searchSubredditAsync(subreddit, product, retailer);
          mentions.addRange(posts);

          // Rate limiting (60 requests/minute for OAuth)
          await this.delay(1000);
        } catch (error) {
          console.error(`Error searching r/${subreddit} for ${product}:`, error);
        }
      }

      if (mentions.length === 0) {
        console.log(`No Reddit mentions found for ${product}`);
        return {
          product,
          retailer: retailer || '',
          windowStartUtc: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          messageCount: 0,
          hypeLexiconDensity: 0.0,
          newAccountRatio: 0.0,
          sentimentScore: 0.0,
          trending: false
        };
      }

      // Fetch author details for account age analysis
      const authorDetails = await this.getAuthorDetailsAsync(
        [...new Set(mentions.map(m => m.author))].slice(0, 50)
      );

      // Calculate metrics
      const hypeCount = mentions.filter(m =>
        this.containsHypeLanguage(m.title + ' ' + m.selftext)
      ).length;
      const hypeDensity = mentions.length > 0 ? hypeCount / mentions.length : 0.0;

      const newAccountCount = authorDetails.filter(a =>
        this.isNewAccount(a, 90)
      ).length;
      const newAccountRatio = authorDetails.length > 0 ? newAccountCount / authorDetails.length : 0.0;

      // Calculate sentiment score (simplified - could be enhanced with NLP)
      const sentimentScore = this.calculateSentimentScore(mentions);

      const trending = this.isTrending(mentions);

      console.log(`Reddit sentiment for ${product}: ${mentions.length} mentions, ${Math.round(hypeDensity * 100)}% hype, ${Math.round(newAccountRatio * 100)}% new accounts`);

      return {
        product,
        retailer: retailer || '',
        windowStartUtc: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        messageCount: mentions.length,
        hypeLexiconDensity: hypeDensity,
        newAccountRatio: newAccountRatio,
        sentimentScore,
        trending
      };
    } catch (error) {
      console.error(`Failed to fetch Reddit data for ${product}:`, error);
      return null;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return;
    }

    console.log('Authenticating with Reddit API');

    const authString = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'User-Agent': this.config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status} ${response.statusText}`);
    }

    const authResp: RedditAuthResponse = await response.json();

    if (!authResp.access_token) {
      throw new Error('Failed to get access token from Reddit');
    }

    this.accessToken = authResp.access_token;
    this.tokenExpiry = new Date(Date.now() + (authResp.expires_in - 60) * 1000); // 60s buffer

    console.log('Reddit authentication successful');
  }

  private async searchSubredditAsync(subreddit: string, product: string, retailer?: string): Promise<RedditPost[]> {
    const posts: RedditPost[] = [];

    // Search query: product name (with retailer if specified)
    let query = product;
    if (retailer) {
      query += ` ${retailer}`;
    }

    const url = `https://oauth.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&t=day&limit=${this.config.searchLimitPerSubreddit}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': this.config.userAgent
      }
    });

    if (!response.ok) {
      console.warn(`Reddit search failed for r/${subreddit}: ${response.status}`);
      return posts;
    }

    const data = await response.json();

    if (!data.data?.children) {
      return posts;
    }

    for (const child of data.data.children) {
      const postData = child.data;

      const post: RedditPost = {
        id: postData.id || '',
        author: postData.author || '',
        title: postData.title || '',
        selftext: postData.selftext || '',
        created_utc: postData.created_utc || 0,
        score: postData.score || 0,
        num_comments: postData.num_comments || 0,
        subreddit,
        url: postData.url || '',
        permalink: postData.permalink || ''
      };

      // Verify product/retailer is actually mentioned (Reddit search can be loose)
      const content = (post.title + ' ' + post.selftext).toLowerCase();
      const searchTerms = [product.toLowerCase()];
      if (retailer) {
        searchTerms.push(retailer.toLowerCase());
      }

      if (searchTerms.some(term => content.includes(term))) {
        posts.push(post);
      }
    }

    console.log(`Found ${posts.length} posts mentioning ${product} in r/${subreddit}`);

    return posts;
  }

  private async getAuthorDetailsAsync(authors: string[]): Promise<RedditUser[]> {
    const users: RedditUser[] = [];

    for (const author of authors) {
      try {
        // Skip deleted/suspended accounts
        if (author.startsWith('[deleted]') || author.startsWith('[removed]')) {
          continue;
        }

        const response = await fetch(`https://oauth.reddit.com/user/${author}/about`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': this.config.userAgent
          }
        });

        if (!response.ok) {
          console.warn(`Failed to get details for u/${author}: ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data.data) {
          users.push(data.data);
        }

        // Rate limiting (60 req/min)
        await this.delay(1000);
      } catch (error) {
        console.warn(`Error fetching details for u/${author}:`, error);
      }
    }

    return users;
  }

  private containsHypeLanguage(text: string): boolean {
    const lower = text.toLowerCase();
    return Array.from(this.hypeTerms).some(term => lower.includes(term));
  }

  private isNewAccount(user: RedditUser, dayThreshold: number): boolean {
    const accountAge = (Date.now() / 1000) - user.created_utc;
    const days = accountAge / (24 * 60 * 60);
    return days < dayThreshold;
  }

  private calculateSentimentScore(posts: RedditPost[]): number {
    // Simplified sentiment analysis based on upvotes and comments
    const totalScore = posts.reduce((sum, post) => sum + post.score, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.num_comments, 0);

    // Normalize to 0-1 scale
    const avgScore = posts.length > 0 ? totalScore / posts.length : 0;
    const avgComments = posts.length > 0 ? totalComments / posts.length : 0;

    // Simple sentiment score: higher scores and comments = more positive sentiment
    const score = Math.min(1, (avgScore / 50 + avgComments / 10) / 2);

    return Math.max(0, score);
  }

  private isTrending(posts: RedditPost[]): boolean {
    // Consider trending if recent posts have high engagement
    const recentPosts = posts.filter(post =>
      (Date.now() / 1000) - post.created_utc < 24 * 60 * 60 // Last 24 hours
    );

    if (recentPosts.length === 0) return false;

    const avgScore = recentPosts.reduce((sum, post) => sum + post.score, 0) / recentPosts.length;
    const avgComments = recentPosts.reduce((sum, post) => sum + post.num_comments, 0) / recentPosts.length;

    // Trending threshold: avg score > 10 and avg comments > 5
    return avgScore > 10 && avgComments > 5;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Factory function for easy configuration
export function createRedditClient(config?: Partial<RedditConfig>): RedditClient {
  const defaultConfig: RedditConfig = {
    clientId: import.meta.env.VITE_REDDIT_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_REDDIT_CLIENT_SECRET || '',
    userAgent: 'VeritasAlpha-Deals/1.0',
    subreddits: ['deals', 'shopping', 'frugal', 'buildapcsales'],
    searchLimitPerSubreddit: 50
  };

  return new RedditClient({ ...defaultConfig, ...config });
}