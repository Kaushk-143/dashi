import React, { useState } from 'react';
import { UserWithSession } from '../types/database';

interface UserAndSessionTableProps {
  users: UserWithSession[];
  onSelectSession: (sessionId: string) => void;
}

export const UserAndSessionTable: React.FC<UserAndSessionTableProps> = ({ users, onSelectSession }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const dataLimit = 10;
  const totalPages = Math.ceil(users.length / dataLimit);

  const goToNextPage = () => {
    setCurrentPage((page) => page + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => page - 1);
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * dataLimit;
    const endIndex = startIndex + dataLimit;
    return users.slice(startIndex, endIndex);
  };

  const paginatedData = getPaginatedData();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Sessions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex flex-col space-y-2">
                      {user.user_sessions.length > 0 ? (
                        user.user_sessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            className="flex justify-between items-center text-left text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors duration-200"
                          >
                            <span className="font-mono text-sm">
                              Session: {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              {session.is_active ? (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" title="Active"></span>
                                </span>
                              ) : (
                                <span className="flex h-2 w-2 rounded-full bg-gray-400" title="Inactive"></span>
                              )}
                              <span className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors duration-200">View →</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No sessions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};