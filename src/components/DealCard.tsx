import React from 'react';
import { Clock, MapPin, Truck, Store, Percent } from 'lucide-react';
import { Deal } from '../types/Deal';

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  isSelected: boolean;
}

export function DealCard({ deal, onClick, isSelected }: DealCardProps) {
  const finalPrice = deal.currentPrice + (deal.collectInStore ? 0 : deal.deliveryCost);
  const savings = deal.originalPrice - finalPrice;
  const isExpiringSoon = deal.expiryDate && 
    new Date(deal.expiryDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="relative">
        <img
          src={deal.image}
          alt={deal.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        
        {/* Deal Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
          deal.dealType === 'clearance' ? 'bg-red-500 text-white' :
          deal.dealType === 'voucher' ? 'bg-green-500 text-white' :
          deal.dealType === 'cashback' ? 'bg-purple-500 text-white' :
          'bg-orange-500 text-white'
        }`}>
          {deal.dealType === 'clearance' ? 'CLEARANCE' :
           deal.dealType === 'voucher' ? 'VOUCHER' :
           deal.dealType === 'cashback' ? 'CASHBACK' :
           'SEASONAL'}
        </div>

        {/* Discount Badge */}
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-bold">
          -{deal.discountPercentage}%
        </div>

        {/* Expiry Warning */}
        {isExpiringSoon && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Expires Soon</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {deal.title}
          </h3>
          <img
            src={deal.retailerLogo}
            alt={deal.retailer}
            className="w-6 h-6 object-contain ml-2"
          />
        </div>

        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {deal.description}
        </p>

        {/* Pricing */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                £{finalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                £{deal.originalPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-green-600 font-semibold text-sm">
              Save £{savings.toFixed(2)}
            </div>
          </div>

          {deal.deliveryCost > 0 && !deal.collectInStore && (
            <div className="text-xs text-gray-500">
              + £{deal.deliveryCost.toFixed(2)} delivery
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {deal.collectInStore && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              <Store className="w-3 h-3 mr-1" />
              Click & Collect
            </span>
          )}
          {deal.cashbackRate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              <Percent className="w-3 h-3 mr-1" />
              {deal.cashbackRate}% Back
            </span>
          )}
          {deal.deliveryCost === 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              <Truck className="w-3 h-3 mr-1" />
              Free Delivery
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-1 ${
            deal.availability === 'in-stock' ? 'text-green-600' :
            deal.availability === 'limited' ? 'text-orange-600' :
            'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              deal.availability === 'in-stock' ? 'bg-green-500' :
              deal.availability === 'limited' ? 'bg-orange-500' :
              'bg-red-500'
            }`}></div>
            <span className="capitalize">{deal.availability.replace('-', ' ')}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{deal.region.length} regions</span>
          </div>
        </div>
      </div>
    </div>
  );
}