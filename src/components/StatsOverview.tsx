import React from 'react';
import { TrendingUp, PoundSterling, Users, Clock } from 'lucide-react';

export function StatsOverview() {
  const stats = [
    {
      label: 'Total Savings This Month',
      value: '£2,847.50',
      icon: PoundSterling,
      change: '+12.5%',
      positive: true,
    },
    {
      label: 'Active Deals Tracked',
      value: '1,247',
      icon: TrendingUp,
      change: '+8.2%',
      positive: true,
    },
    {
      label: 'Users Alerted Today',
      value: '15,832',
      icon: Users,
      change: '+15.7%',
      positive: true,
    },
    {
      label: 'Avg. Response Time',
      value: '2.3s',
      icon: Clock,
      change: '-0.5s',
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}