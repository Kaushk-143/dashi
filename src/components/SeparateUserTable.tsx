// src/components/SeparateUserTable.tsx
import React, { useState } from 'react';
import { UserWithSession } from '../types/database';

interface SeparateUserTableProps {
  users: UserWithSession[];
  filterType: 'daily' | 'lastMonth' | 'custom';
  setFilter: (type: 'daily' | 'lastMonth' | 'custom', range?: { startDate: string, endDate: string }) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  handleCustomFilter: () => void;
  renderFilterControls: (
    filterType: 'daily' | 'lastMonth' | 'custom',
    setFilter: (type: 'daily' | 'lastMonth' | 'custom', range?: { startDate: string, endDate: string }) => void,
    customStartDate: string,
    setCustomStartDate: (date: string) => void,
    customEndDate: string,
    setCustomEndDate: (date: string) => void,
    handleCustomFilter: () => void,
  ) => JSX.Element;
}

export const SeparateUserTable: React.FC<SeparateUserTableProps> = ({
  users,
  filterType,
  setFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  handleCustomFilter,
  renderFilterControls,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const nameMatch = fullName.includes(searchTerm.toLowerCase());
    const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Users Data</h2>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {renderFilterControls(
            filterType,
            setFilter,
            customStartDate,
            setCustomStartDate,
            customEndDate,
            setCustomEndDate,
            handleCustomFilter
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`${user.first_name} ${user.last_name}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};