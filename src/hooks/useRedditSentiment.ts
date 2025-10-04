import { useState, useEffect } from 'react';
import { SocialSentiment } from '../types/Reddit';
import { RedditClient, createRedditClient } from '../services/redditClient';

interface UseRedditSentimentOptions {
  product: string;
  retailer?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseRedditSentimentResult {
  sentiment: SocialSentiment | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRedditSentiment({
  product,
  retailer,
  enabled = true,
  refetchInterval
}: UseRedditSentimentOptions): UseRedditSentimentResult {
  const [sentiment, setSentiment] = useState<SocialSentiment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redditClient = createRedditClient();

  const fetchSentiment = async () => {
    if (!enabled || !product) return;

    setLoading(true);
    setError(null);

    try {
      const result = await redditClient.getSocialSentimentAsync(product, retailer);
      setSentiment(result);
    } catch (err) {
      console.error('Error fetching Reddit sentiment:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sentiment');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchSentiment();
  };

  useEffect(() => {
    fetchSentiment();
  }, [product, retailer, enabled]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(fetchSentiment, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, product, retailer, enabled]);

  return {
    sentiment,
    loading,
    error,
    refetch
  };
}