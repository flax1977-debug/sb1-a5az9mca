import React from 'react';
import { X, ExternalLink, Heart, Share2, TrendingUp, MapPin, Truck, Store, Shield } from 'lucide-react';
import { Deal } from '../types/Deal';
import { PriceChart } from './PriceChart';

interface DealDetailsProps {
  deal: Deal;
  onClose: () => void;
}

export function DealDetails({ deal, onClose }: DealDetailsProps) {
  const finalPrice = deal.currentPrice + (deal.collectInStore ? 0 : deal.deliveryCost);
  const savings = deal.originalPrice - finalPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Deal Details</h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image and Basic Info */}
            <div>
              <img
                src={deal.image}
                alt={deal.title}
                className="w-full h-80 object-cover rounded-xl mb-4"
              />
              
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
                <p className="text-gray-600">{deal.description}</p>
                
                <div className="flex items-center space-x-4">
                  <img
                    src={deal.retailerLogo}
                    alt={deal.retailer}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-medium text-gray-900">{deal.retailer}</span>
                </div>
              </div>
            </div>

            {/* Pricing and Purchase Options */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    £{finalPrice.toFixed(2)}
                  </div>
                  <div className="text-lg text-gray-500 line-through">
                    £{deal.originalPrice.toFixed(2)}
                  </div>
                  <div className="text-green-600 font-semibold">
                    You save £{savings.toFixed(2)} ({deal.discountPercentage}% off)
                  </div>
                  {!deal.vatIncluded && (
                    <p className="text-xs text-gray-500">*Prices exclude VAT</p>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {deal.voucherCode && (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600 mb-1">Voucher Code:</p>
                      <p className="font-mono font-bold text-lg text-blue-600">{deal.voucherCode}</p>
                    </div>
                  )}

                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>Get This Deal</span>
                  </button>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Delivery Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Standard Delivery</span>
                    </div>
                    <span className="text-sm font-medium">
                      {deal.deliveryCost === 0 ? 'FREE' : `£${deal.deliveryCost.toFixed(2)}`}
                    </span>
                  </div>
                  {deal.collectInStore && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Store className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Click & Collect</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">FREE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Regional Availability */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Available In</h3>
                <div className="flex flex-wrap gap-2">
                  {deal.region.map((region, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {/* Consumer Protection */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">UK Consumer Protection</h3>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 14-day returns under Distance Selling Regulations</li>
                  <li>• Price verified against Consumer Rights Act</li>
                  <li>• GDPR compliant data handling</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Price History Chart */}
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Price History</h3>
            </div>
            <PriceChart priceHistory={deal.priceHistory} />
          </div>

          {/* Features */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deal.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}