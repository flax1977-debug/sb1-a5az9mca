import React from 'react';
import { PricePoint } from '../types/Deal';

interface PriceChartProps {
  priceHistory: PricePoint[];
}

export function PriceChart({ priceHistory }: PriceChartProps) {
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Price line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={priceHistory.map((point, index) => {
              const x = (index / (priceHistory.length - 1)) * 380 + 10;
              const y = 190 - ((point.price - minPrice) / priceRange) * 170;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Data points */}
          {priceHistory.map((point, index) => {
            const x = (index / (priceHistory.length - 1)) * 380 + 10;
            const y = 190 - ((point.price - minPrice) / priceRange) * 170;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Price labels */}
        <div className="absolute top-0 left-0 text-xs text-gray-500">
          £{maxPrice.toFixed(0)}
        </div>
        <div className="absolute bottom-0 left-0 text-xs text-gray-500">
          £{minPrice.toFixed(0)}
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{new Date(priceHistory[0]?.date).toLocaleDateString('en-GB')}</span>
        <span>{new Date(priceHistory[priceHistory.length - 1]?.date).toLocaleDateString('en-GB')}</span>
      </div>
    </div>
  );
}