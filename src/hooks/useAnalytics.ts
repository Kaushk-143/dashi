import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { 
  User, 
  UserWithSession, 
  AnalyticsOverview, 
  EventAnalytics, 
  TrafficSource, 
  PageAnalytics,
  UserAnalyticsEvent,
  SessionWithEvents
} from '../types/database';

import { fetchEventCountsByType, fetchUserSessionEvents } from '../utils/dataFetchers';

export const useAnalytics = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [users, setUsers] = useState<UserWithSession[]>([]);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithEvents | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [eventFilterType, setEventFilterType] = useState<'daily' | 'lastMonth' | 'custom'>('daily');
  const [customEventDateRange, setCustomEventDateRange] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });
  
  const [trafficFilterType, setTrafficFilterType] = useState<'daily' | 'lastMonth' | 'custom'>('daily');
  const [customTrafficDateRange, setCustomTrafficDateRange] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });
  
  const [userFilterType, setUserFilterType] = useState<'daily' | 'lastMonth' | 'custom'>('daily');
  const [customUserDateRange, setCustomUserDateRange] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });
  
  // NEW: State for page analytics filter
  const [pageFilterType, setPageFilterType] = useState<'daily' | 'lastMonth' | 'custom'>('daily');
  const [customPageDateRange, setCustomPageDateRange] = useState<{ startDate: string | null, endDate: string | null }>({ startDate: null, endDate: null });

  const getFilterDates = useCallback((filterType, customRange) => {
    const today = new Date();
    const endDate = today.toISOString();
    let startDate: string;

    switch (filterType) {
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        startDate = lastMonth.toISOString();
        return { startDate, endDate };
      case 'custom':
        return { startDate: customRange.startDate, endDate: customRange.endDate };
      case 'daily':
      default:
        const yesterday = new Date(today.setDate(today.getDate() - 1));
        startDate = yesterday.toISOString();
        return { startDate, endDate };
    }
  }, []);

const fetchOverview = async () => {
    try {
      // Fetch total users and user type breakdown from the 'users' table (keep this part)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('user_type, has_active_subscription');

      if (usersError) throw usersError;

      // Fetch active users from user_sessions table (keep this part)
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('is_active', true);

      if (activeUsersError) throw activeUsersError;

      // Fetch active subscriptions from the 'subscriptions' table
      const { count: activeSubscriptionsCount, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (subscriptionsError) throw subscriptionsError;

      const totalUsers = usersData.length;
      const activeUsers = new Set(activeUsersData.map(session => session.user_id)).size;

      const subscriptionBreakdown = {
        active: activeSubscriptionsCount || 0,
        inactive: usersData.filter(user => !user.has_active_subscription).length
      };

      const userTypeBreakdown = {
        standard: usersData.filter(user => user.user_type === 'standard').length,
        premium: usersData.filter(user => user.user_type === 'premium').length
      };

      setOverview({
        totalUsers,
        activeUsers,
        subscriptionBreakdown,
        userTypeBreakdown
      });
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Failed to fetch overview data');
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const { startDate, endDate } = getFilterDates(userFilterType, customUserDateRange);

      let query = supabase
        .from('users')
        .select(`
          *,
          user_sessions (*)
        `);
      
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users data');
    }
  }, [userFilterType, customUserDateRange, getFilterDates]);

  const fetchEventAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getFilterDates(eventFilterType, customEventDateRange);
      const data = await fetchEventCountsByType({ start: startDate, end: endDate });
      setEventAnalytics(data);
    } catch (err) {
      console.error('Error fetching event analytics:', err);
      setError('Failed to fetch event analytics');
    } finally {
      setLoading(false);
    }
  }, [eventFilterType, customEventDateRange, getFilterDates]);

  const fetchTrafficSources = useCallback(async () => {
    try {
      const { startDate, endDate } = getFilterDates(trafficFilterType, customTrafficDateRange);

      let query = supabase
        .from('user_analytics_events')
        .select('utm_source, utm_medium, utm_campaign')
        .not('utm_source', 'is', null);

      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      const sourceMap: Record<string, TrafficSource> = {};
      
      (data || []).forEach(event => {
        const key = `${event.utm_source}-${event.utm_medium || ''}-${event.utm_campaign || ''}`;
        
        if (!sourceMap[key]) {
          sourceMap[key] = {
            utm_source: event.utm_source,
            utm_medium: event.utm_medium,
            utm_campaign: event.utm_campaign,
            count: 0
          };
        }
        
        sourceMap[key].count++;
      });

      setTrafficSources(Object.values(sourceMap).sort((a, b) => b.count - a.count));
    } catch (err) {
      console.error('Error fetching traffic sources:', err);
      setError('Failed to fetch traffic sources');
    }
  }, [trafficFilterType, customTrafficDateRange, getFilterDates]);

  // NEW: fetchPageAnalytics now accepts filter arguments
  const fetchPageAnalytics = useCallback(async () => {
    try {
      const { startDate, endDate } = getFilterDates(pageFilterType, customPageDateRange);
      
      let query = supabase
        .from('user_analytics_events')
        .select('page_path, user_id')
        .not('page_path', 'is', null);
      
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      const pageMap: Record<string, { visits: number; users: Set<string> }> = {};
      
      (data || []).forEach(event => {
        const path = event.page_path;
        if (!pageMap[path]) {
          pageMap[path] = { visits: 0, users: new Set() };
        }
        pageMap[path].visits++;
        pageMap[path].users.add(event.user_id);
      });

      const analytics: PageAnalytics[] = Object.entries(pageMap)
        .map(([path, data]) => ({
          page_path: path,
          visits: data.visits,
          unique_users: data.users.size,
        }))
        .sort((a, b) => b.visits - a.visits);

      setPageAnalytics(analytics);
    } catch (err) {
      console.error('Error fetching page analytics:', err);
      setError('Failed to fetch page analytics');
    }
  }, [pageFilterType, customPageDateRange, getFilterDates]);

  const openSessionDrawer = useCallback(async (sessionId: string) => {
    setIsDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerError(null);
    setSelectedSession(null);

    try {
      const sessionData = await fetchUserSessionEvents(sessionId);
      if (sessionData) {
        setSelectedSession(sessionData);
      } else {
        setDrawerError("Session data not found.");
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
      setDrawerError('Failed to fetch session details');
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const closeSessionDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedSession(null);
    setDrawerError(null);
  }, []);


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchOverview(),
          fetchUsers(),
          fetchEventAnalytics(),
          fetchTrafficSources(),
          fetchPageAnalytics()
        ]);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [fetchUsers, fetchEventAnalytics, fetchTrafficSources, fetchPageAnalytics]);

  const setEventDateFilter = (filter: 'daily' | 'lastMonth' | 'custom', customRange?: { startDate: string, endDate: string }) => {
    setEventFilterType(filter);
    if (filter === 'custom' && customRange) {
      setCustomEventDateRange(customRange);
    } else {
      setCustomEventDateRange({ startDate: null, endDate: null });
    }
  };

  const setTrafficDateFilter = (filter: 'daily' | 'lastMonth' | 'custom', customRange?: { startDate: string, endDate: string }) => {
    setTrafficFilterType(filter);
    if (filter === 'custom' && customRange) {
      setCustomTrafficDateRange(customRange);
    } else {
      setCustomTrafficDateRange({ startDate: null, endDate: null });
    }
  };
  
  const setUserDateFilter = (filter: 'daily' | 'lastMonth' | 'custom', customRange?: { startDate: string, endDate: string }) => {
    setUserFilterType(filter);
    if (filter === 'custom' && customRange) {
      setCustomUserDateRange(customRange);
    } else {
      setCustomUserDateRange({ startDate: null, endDate: null });
    }
  };

  // NEW: Setter for page date filter
  const setPageDateFilter = (filter: 'daily' | 'lastMonth' | 'custom', customRange?: { startDate: string, endDate: string }) => {
    setPageFilterType(filter);
    if (filter === 'custom' && customRange) {
      setCustomPageDateRange(customRange);
    } else {
      setCustomPageDateRange({ startDate: null, endDate: null });
    }
  };

  return {
    overview,
    users,
    eventAnalytics,
    trafficSources,
    pageAnalytics,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      Promise.all([
        fetchOverview(),
        fetchUsers(),
        fetchEventAnalytics(),
        fetchTrafficSources(),
        fetchPageAnalytics()
      ]).finally(() => setLoading(false));
    },
    eventFilterType,
    customEventDateRange,
    setEventDateFilter,
    trafficFilterType,
    customTrafficDateRange,
    setTrafficDateFilter,
    userFilterType,
    customUserDateRange,
    setUserDateFilter,
    // NEW: Return page filter state and setters
    pageFilterType,
    customPageDateRange,
    setPageDateFilter,
    
    isDrawerOpen,
    selectedSession,
    drawerLoading,
    drawerError,
    openSessionDrawer,
    closeSessionDrawer,
  };
};