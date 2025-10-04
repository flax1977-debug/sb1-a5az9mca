// Reddit API integration types for Veritas Alpha shopping deals app

export interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
  subreddits: string[];
  searchLimitPerSubreddit: number;
}

export interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface RedditPost {
  id: string;
  author: string;
  title: string;
  selftext: string;
  created_utc: number;
  score: number;
  num_comments: number;
  subreddit: string;
  url: string;
  permalink: string;
}

export interface RedditUser {
  name: string;
  created_utc: number;
  link_karma: number;
  comment_karma: number;
}

export interface SocialSentiment {
  product: string;
  retailer: string;
  windowStartUtc: string;
  messageCount: number;
  hypeLexiconDensity: number;
  newAccountRatio: number;
  sentimentScore: number;
  trending: boolean;
}

export interface RedditSearchResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

export interface RedditUserResponse {
  data: RedditUser;
}