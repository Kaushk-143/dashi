import React from 'react';
import { Users, UserCheck, CreditCard, Crown } from 'lucide-react';
import { AnalyticsOverview } from '../types/database';

interface OverviewCardsProps {
  overview: AnalyticsOverview;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const cards = [
    {
      title: 'Total Users',
      value: overview.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: overview.activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Active Subscriptions',
      value: overview.subscriptionBreakdown.active.toLocaleString(),
      icon: CreditCard,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Premium Users',
      value: overview.userTypeBreakdown.premium.toLocaleString(),
      icon: Crown,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};