import React, { useState, useMemo } from 'react';
import { Search, Filter, Check, X } from 'lucide-react';
import { UserWithSession } from '../types/database';
import { format } from 'date-fns';

interface UserTableProps {
  users: UserWithSession[];
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'premium'>('all');
  const [filterSubscription, setFilterSubscription] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || user.user_type === filterType;
      
      const matchesSubscription = 
        filterSubscription === 'all' ||
        (filterSubscription === 'active' && user.has_active_subscription) ||
        (filterSubscription === 'inactive' && !user.has_active_subscription);

      return matchesSearch && matchesType && matchesSubscription;
    });
  }, [users, searchTerm, filterType, filterSubscription]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Users</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
          
          <select
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Subscriptions</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Subscription</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Active Session</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const hasActiveSession = user.user_sessions.some(session => session.is_active);
              
              return (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{user.email}</td>
                  <td className="py-4 px-4 text-gray-600">{user.phone || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.user_type === 'premium' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {user.has_active_subscription ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {hasActiveSession ? (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-green-600 text-sm">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          <span className="text-gray-500 text-sm">Inactive</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};