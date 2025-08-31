import React from 'react';
import { Search, Bell, Settings, User, MapPin } from 'lucide-react';

interface HeaderProps {
  activeView: 'dashboard' | 'preferences';
  onViewChange: (view: 'dashboard' | 'preferences') => void;
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BH</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Bargain Hunter AI</h1>
              <p className="text-xs text-gray-500">UK's Smartest Deal Finder</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products, retailers, or deals..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Location & Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>SW1A 1AA</span>
            </div>
            
            <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <button 
              onClick={() => onViewChange('preferences')}
              className={`p-2 transition-colors ${
                activeView === 'preferences' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}