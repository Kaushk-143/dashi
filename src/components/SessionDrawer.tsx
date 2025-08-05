import React from 'react';
import { X, User, Calendar, Clock, Globe, CreditCard, Activity, Eye } from 'lucide-react';
import { SessionWithEvents } from '../types/database';
import { format } from 'date-fns';

interface SessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: SessionWithEvents | null;
  loading: boolean;
  error: string | null;
}

export const SessionDrawer: React.FC<SessionDrawerProps> = ({
  isOpen,
  onClose,
  sessionData,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-2xl">
          <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
            <div className="px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  User Session Details
                </h2>
                <div className="ml-3 h-7 flex items-center">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 relative flex-1 px-4 sm:px-6">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading session details...</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              
              {sessionData && (
                <div className="space-y-6">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">{sessionData.user.first_name} {sessionData.user.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{sessionData.user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{sessionData.user.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User Type</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sessionData.user.user_type === 'premium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sessionData.user.user_type}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-sm text-gray-900">{format(new Date(sessionData.user.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Subscription</p>
                        <p className="text-sm text-gray-900">{sessionData.user.has_active_subscription ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Information */}
                  {sessionData.subscription && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Plan</p>
                          <p className="text-sm text-gray-900">{sessionData.subscription.plan_id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sessionData.subscription.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : sessionData.subscription.status === 'trialing'
                              ? 'bg-blue-100 text-blue-800'
                              : sessionData.subscription.status === 'past_due'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sessionData.subscription.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Plan Type</p>
                          <p className="text-sm text-gray-900">{sessionData.subscription.plan_type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Trial</p>
                          <p className="text-sm text-gray-900">{format(new Date(sessionData.user.created_at), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Current Period End</p>
                          <p className="text-sm text-gray-900">{format(new Date(sessionData.subscription.current_period_end), 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Session Statistics */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Activity className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Session Statistics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Session Started</p>
                        <p className="text-sm text-gray-900">{format(new Date(sessionData.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Events</p>
                        <p className="text-sm text-gray-900">{sessionData.sessionStats.total_events}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Unique Pages</p>
                        <p className="text-sm text-gray-900">{sessionData.sessionStats.unique_pages}</p>
                      </div>
                      {sessionData.sessionStats.session_duration && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Duration</p>
                          <p className="text-sm text-gray-900">{sessionData.sessionStats.session_duration}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Page Visits */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Eye className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Page Visits</h3>
                    </div>
                    {sessionData.pageVisits.length > 0 ? (
                      <div className="space-y-3">
                        {sessionData.pageVisits.map((visit, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-purple-200 last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{visit.page_path}</p>
                              <p className="text-xs text-gray-500">Last visited: {format(new Date(visit.last_visited), 'MMM dd, HH:mm')}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {visit.visit_count} visits
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No page visits recorded for this session.</p>
                    )}
                  </div>

                  {/* Event Timeline */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Clock className="w-5 h-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Event Timeline</h3>
                    </div>
                    {sessionData.events.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {sessionData.events.map((event, index) => (
                          <div key={event.id} className="flex items-start space-x-3 p-3 bg-white rounded-md border">
                            <div className="flex-shrink-0">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                event.event_type === 'page_view' ? 'bg-blue-500' :
                                event.event_type === 'button_click' ? 'bg-green-500' :
                                event.event_type === 'form_submission' ? 'bg-purple-500' :
                                event.event_type === 'video_play' ? 'bg-red-500' :
                                'bg-gray-500'
                              }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {event.event_type} - {event.event_category}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(event.created_at), 'HH:mm:ss')}
                                </p>
                              </div>
                              {event.page_path && (
                                <p className="text-xs text-gray-600 mt-1">
                                  <Globe className="w-3 h-3 inline mr-1" />
                                  {event.page_path}
                                </p>
                              )}
                              {event.event_action && (
                                <p className="text-xs text-gray-600">
                                  Action: {event.event_action}
                                </p>
                              )}
                              {event.event_data && Object.keys(event.event_data).length > 0 && (
                                <div className="mt-1">
                                  <p className="text-xs text-gray-500">Data:</p>
                                  <pre className="text-xs text-gray-600 bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                                    {JSON.stringify(event.event_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No events found for this session.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};