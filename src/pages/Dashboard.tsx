// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Sidebar } from '../components/Sidebar';
import { OverviewCards } from '../components/OverviewCards';
// REMOVED: UserTable component is not used
import { UserTable } from '../components/UserTable';
import { EventChart } from '../components/EventChart';
import { TrafficSourcesChart } from '../components/TrafficSourcesChart';
import { PageAnalyticsTable } from '../components/PageAnalyticsTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { SeparateUserTable } from '../components/SeparateUserTable';
import { SessionDrawer } from '../components/SessionDrawer';
import { UserAndSessionTable } from '../components/UserAndSessionTable';

export const Dashboard: React.FC = () => {
  const {
    overview,
    users,
    eventAnalytics,
    trafficSources,
    pageAnalytics,
    loading,
    error,
    refetch,
    eventFilterType,
    customEventDateRange,
    setEventDateFilter,
    trafficFilterType,
    customTrafficDateRange,
    setTrafficDateFilter,
    userFilterType,
    customUserDateRange,
    setUserDateFilter,
    pageFilterType,
    customPageDateRange,
    setPageDateFilter,
    isDrawerOpen,
    selectedSession,
    drawerLoading,
    drawerError,
    openSessionDrawer,
    closeSessionDrawer,
  } = useAnalytics();

  const [customEventStartDate, setCustomEventStartDate] = useState('');
  const [customEventEndDate, setCustomEventEndDate] = useState('');
  const [customTrafficStartDate, setCustomTrafficStartDate] = useState('');
  const [customTrafficEndDate, setCustomTrafficEndDate] = useState('');
  const [customUserStartDate, setCustomUserStartDate] = useState('');
  const [customUserEndDate, setCustomUserEndDate] = useState('');
  const [customPageStartDate, setCustomPageStartDate] = useState('');
  const [customPageEndDate, setCustomPageEndDate] = useState('');

  const handleCustomEventFilter = () => {
    setEventDateFilter('custom', { startDate: customEventStartDate, endDate: customEventEndDate });
  };
  const handleCustomTrafficFilter = () => {
    setTrafficDateFilter('custom', { startDate: customTrafficStartDate, endDate: customTrafficEndDate });
  };
  const handleCustomUserFilter = () => {
    setUserDateFilter('custom', { startDate: customUserStartDate, endDate: customUserEndDate });
  };
  const handleCustomPageFilter = () => {
    setPageDateFilter('custom', { startDate: customPageStartDate, endDate: customPageEndDate });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const renderFilterControls = (
    filterType: 'daily' | 'lastMonth' | 'custom',
    setFilter: (type: 'daily' | 'lastMonth' | 'custom', range?: { startDate: string, endDate: string }) => void,
    customStartDate: string,
    setCustomStartDate: (date: string) => void,
    customEndDate: string,
    setCustomEndDate: (date: string) => void,
    handleCustomFilter: () => void,
  ) => (
    <>
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('daily')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filterType === 'daily' 
              ? 'bg-yellow-500 text-blue-800 shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Daily
        </button>
        <button
          onClick={() => setFilter('lastMonth')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
            ${filterType === 'lastMonth' 
              ? 'bg-yellow-500 text-blue-800 shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Last Month
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 text-sm font-medium">Custom Range:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleCustomFilter}
          disabled={!customStartDate || !customEndDate}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 bg-yellow-500 text-blue-800 shadow-md hover:bg-yellow-600 disabled:bg-yellow-300"
        >
          Apply Custom Filter
        </button>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar className="fixed top-0 left-0 z-50" />
      
      <main className="ml-20 lg:ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Analytics Dashboard</h1>
            <p className="text-gray-600">
              Comprehensive insights into user behavior, engagement, and performance metrics.
            </p>
          </div>

          {overview && <OverviewCards overview={overview} />}
          
          <div className="grid grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Event Analytics</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                {renderFilterControls(
                  eventFilterType,
                  setEventDateFilter,
                  customEventStartDate,
                  setCustomEventStartDate,
                  customEventEndDate,
                  setCustomEventEndDate,
                  handleCustomEventFilter
                )}
              </div>
              <EventChart data={eventAnalytics} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Traffic Sources</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                {renderFilterControls(
                  trafficFilterType,
                  setTrafficDateFilter,
                  customTrafficStartDate,
                  setCustomTrafficStartDate,
                  customTrafficEndDate,
                  setCustomTrafficEndDate,
                  handleCustomTrafficFilter
                )}
              </div>
              <TrafficSourcesChart data={trafficSources} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Page Analytics</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                {renderFilterControls(
                  pageFilterType,
                  setPageDateFilter,
                  customPageStartDate,
                  setCustomPageStartDate,
                  customPageEndDate,
                  setCustomPageEndDate,
                  handleCustomPageFilter
                )}
              </div>
              <PageAnalyticsTable data={pageAnalytics} />
            </div>
          </div>
          
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Users & Sessions</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              {renderFilterControls(
                userFilterType,
                setUserDateFilter,
                customUserStartDate,
                setCustomUserStartDate,
                customUserEndDate,
                setCustomUserEndDate,
                handleCustomUserFilter
              )}
            </div>
            <UserAndSessionTable users={users} onSelectSession={openSessionDrawer} />
          </div>

          <SeparateUserTable 
            users={users} 
            filterType={userFilterType}
            setFilter={setUserDateFilter}
            customStartDate={customUserStartDate}
            setCustomStartDate={setCustomUserStartDate}
            customEndDate={customUserEndDate}
            setCustomEndDate={setCustomUserEndDate}
            handleCustomFilter={handleCustomUserFilter}
            renderFilterControls={renderFilterControls}
          />
          
        </div>
      </main>

      <SessionDrawer
        isOpen={isDrawerOpen}
        onClose={closeSessionDrawer}
        sessionData={selectedSession}
        loading={drawerLoading}
        error={drawerError}
      />
    </div>
  );
};