import React from 'react';
import { PageAnalytics } from '../types/database';

interface PageAnalyticsTableProps {
  data: PageAnalytics[];
}

export const PageAnalyticsTable: React.FC<PageAnalyticsTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Page Analytics</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Page Path</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Total Visits</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Unique Users</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Avg. Visits per User</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((page, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {page.page_path}
                  </code>
                </td>
                <td className="py-4 px-4 font-semibold text-gray-900">
                  {page.visits.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {page.unique_users.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {(page.visits / page.unique_users).toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No page analytics data available.</p>
        </div>
      )}
    </div>
  );
};