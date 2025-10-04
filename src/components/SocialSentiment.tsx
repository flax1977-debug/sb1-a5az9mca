import React from 'react';
import { TrendingUp, Users, MessageCircle, AlertTriangle } from 'lucide-react';
import { SocialSentiment } from '../types/Reddit';
import { useRedditSentiment } from '../hooks/useRedditSentiment';

interface SocialSentimentProps {
  product: string;
  retailer?: string;
  className?: string;
}

export function SocialSentiment({ product, retailer, className = '' }: SocialSentimentProps) {
  const { sentiment, loading, error, refetch } = useRedditSentiment({
    product,
    retailer,
    enabled: true,
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });

  if (loading && !sentiment) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 text-sm ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        <span>Loading social data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 text-sm ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>Social data unavailable</span>
        <button
          onClick={refetch}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!sentiment || sentiment.messageCount === 0) {
    return null;
  }

  const hypeIntensity = sentiment.hypeLexiconDensity;
  const hypeColor = hypeIntensity > 0.3 ? 'text-red-600' : hypeIntensity > 0.15 ? 'text-orange-600' : 'text-green-600';
  const hypeLabel = hypeIntensity > 0.3 ? 'High Hype' : hypeIntensity > 0.15 ? 'Medium Hype' : 'Low Hype';

  const sentimentColor = sentiment.sentimentScore > 0.6 ? 'text-green-600' :
                        sentiment.sentimentScore > 0.3 ? 'text-yellow-600' : 'text-red-600';
  const sentimentLabel = sentiment.sentimentScore > 0.6 ? 'Positive' :
                        sentiment.sentimentScore > 0.3 ? 'Neutral' : 'Negative';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Trending Indicator */}
      {sentiment.trending && (
        <div className="flex items-center space-x-1 text-green-600 text-sm font-semibold">
          <TrendingUp className="w-4 h-4" />
          <span>Trending on Reddit</span>
        </div>
      )}

      {/* Social Metrics */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">{sentiment.messageCount} mentions</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className={`font-medium ${hypeColor}`}>
            {Math.round(hypeIntensity * 100)}% hype
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
            {Math.round(sentiment.newAccountRatio * 100)}% new users
          </span>
        </div>

        <div className={`font-medium ${sentimentColor}`}>
          {sentimentLabel}
        </div>
      </div>

      {/* Hype Level Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            hypeIntensity > 0.3 ? 'bg-red-500' :
            hypeIntensity > 0.15 ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(hypeIntensity * 100, 100)}%` }}
        ></div>
      </div>

      <div className="text-xs text-gray-500">
        Based on Reddit discussions from last 24h
      </div>
    </div>
  );
}