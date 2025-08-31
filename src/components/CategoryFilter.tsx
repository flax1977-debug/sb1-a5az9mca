import React from 'react';
import { ShoppingCart, Smartphone, Shirt, Home, Heart, Wrench } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'All Deals', icon: ShoppingCart },
  { id: 'groceries', name: 'Groceries', icon: ShoppingCart },
  { id: 'electronics', name: 'Electronics', icon: Smartphone },
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'home', name: 'Home & Garden', icon: Home },
  { id: 'health', name: 'Health & Beauty', icon: Heart },
  { id: 'diy', name: 'DIY & Tools', icon: Wrench },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const IconComponent = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}