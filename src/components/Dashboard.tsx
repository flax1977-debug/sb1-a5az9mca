import React, { useState } from 'react';
import { DealCard } from './DealCard';
import { CategoryFilter } from './CategoryFilter';
import { StatsOverview } from './StatsOverview';
import { TrendingDeals } from './TrendingDeals';
import { Deal } from '../types/Deal';
import { mockDeals } from '../data/mockDeals';

interface DashboardProps {
  onDealSelect: (deal: Deal) => void;
  selectedDeal: Deal | null;
}

export function Dashboard({ onDealSelect, selectedDeal }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'expiry'>('discount');

  const filteredDeals = mockDeals
    .filter(deal => selectedCategory === 'all' || deal.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return b.discount - a.discount;
        case 'price':
          return a.currentPrice - b.currentPrice;
        case 'expiry':
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <StatsOverview />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'discount' | 'price' | 'expiry')}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="discount">Highest Discount</option>
                <option value="price">Lowest Price</option>
                <option value="expiry">Expiring Soon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => onDealSelect(deal)}
                isSelected={selectedDeal?.id === deal.id}
              />
            ))}
          </div>
        </div>

        <div className="lg:w-1/4">
          <TrendingDeals />
        </div>
      </div>
    </div>
  );
}