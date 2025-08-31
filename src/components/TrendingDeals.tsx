import React from 'react';
import { TrendingUp, Siren as Fire } from 'lucide-react';

export function TrendingDeals() {
  const trendingItems = [
    { name: 'Apple AirPods Pro', retailer: 'Currys', discount: '25%', price: '£179.99' },
    { name: 'Dyson V15 Detect', retailer: 'John Lewis', discount: '20%', price: '£399.99' },
    { name: 'Samsung 55" QLED TV', retailer: 'Amazon UK', discount: '30%', price: '£549.99' },
    { name: 'Nike Air Max 270', retailer: 'JD Sports', discount: '40%', price: '£89.99' },
    { name: 'Instant Pot Duo 7-in-1', retailer: 'Argos', discount: '35%', price: '£64.99' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Fire className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900">Trending Deals</h3>
      </div>

      <div className="space-y-3">
        {trendingItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-500">{item.retailer}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900">{item.price}</p>
              <p className="text-xs text-green-600 font-medium">{item.discount} off</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 py-2 text-blue-600 hover:text-blue-700 transition-colors">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">View All Trending</span>
        </button>
      </div>
    </div>
  );
}