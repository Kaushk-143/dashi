import { supabase } from './supabase';
import { UserAnalyticsEvent, SessionWithEvents } from '../types/database';

/**
 * Utility functions for data fetching operations
 * Centralized data access layer for consistent error handling and query patterns
 */

/**
 * Generic error handler for Supabase operations
 */
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message}`);
};

/**
 * Fetch analytics events with comprehensive filtering options
 * Supports event type, category, action, and date range filtering
 */
export const fetchAnalyticsEvents = async (filters: {
  userId?: string;
  eventType?: string;
  eventCategory?: string;
  eventAction?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    let query = supabase
      .from('user_analytics_events')
      .select(`
        id,
        user_id,
        session_id,
        event_type,
        event_category,
        event_action,
        page_path,
        page_title,
        page_section,
        event_data,
        duration_seconds,
        value_numeric,
        value_text,
        user_agent,
        viewport_width,
        viewport_height,
        device_type,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        consent_given,
        anonymized,
        event_timestamp,
        created_at,
        updated_at,
        users (
          first_name,
          last_name,
          email
        )
      `);

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }

    if (filters.eventCategory) {
      query = query.eq('event_category', filters.eventCategory);
    }

    if (filters.eventAction) {
      query = query.eq('event_action', filters.eventAction);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'fetch analytics events');
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching analytics events:', err);
    throw err;
  }
};

/**
 * Fetch event counts grouped by type for dashboard charts
 */
export const fetchEventCountsByType = async (dateRange?: { start: string; end: string }) => {
  try {
    let query = supabase
      .from('user_analytics_events')
      .select('event_type, created_at');

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      handleSupabaseError(error, 'fetch event counts by type');
    }

    // Group by event type and count
    const eventCounts: Record<string, number> = {};
    (data || []).forEach(event => {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    });

    return Object.entries(eventCounts).map(([type, count]) => ({
      eventType: type,
      count
    }));
  } catch (err) {
    console.error('Error fetching event counts by type:', err);
    throw err;
  }
};

/**
 * Fetch user session analytics
 * Returns active vs inactive session statistics
 */
export const fetchSessionAnalytics = async () => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        id,
        user_id,
        started_at,
        last_active_at,
        ended_at,
        ip_address,
        user_agent,
        device_info,
        is_active,
        metadata,
        user_email,
        user_first_name,
        user_last_name,
        users (
          first_name,
          last_name,
          email,
          user_type
        )
      `);

    if (error) {
      handleSupabaseError(error, 'fetch session analytics');
    }

    const sessions = data || [];
    const activeSessions = sessions.filter(s => s.is_active);
    const inactiveSessions = sessions.filter(s => !s.is_active);

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      inactiveSessions: inactiveSessions.length,
      activeSessionRate: sessions.length > 0 
        ? (activeSessions.length / sessions.length * 100).toFixed(1)
        : '0',
      sessions: sessions
    };
  } catch (err) {
    console.error('Error fetching session analytics:', err);
    throw err;
  }
};

/**
 * Fetch UTM campaign performance data
 * Analyzes traffic sources and campaign effectiveness
 */
export const fetchCampaignAnalytics = async () => {
  try {
    const { data, error } = await supabase
      .from('user_analytics_events')
      .select('utm_campaign, utm_source, utm_medium, event_type, created_at')
      .not('utm_campaign', 'is', null);

    if (error) {
      handleSupabaseError(error, 'fetch campaign analytics');
    }

    // Group by campaign and calculate metrics
    const campaignMap: Record<string, {
      campaign: string;
      source: string;
      medium: string;
      events: number;
      uniqueDays: Set<string>;
    }> = {};

    (data || []).forEach(event => {
      const key = `${event.utm_campaign}-${event.utm_source}-${event.utm_medium}`;
      const date = new Date(event.created_at).toISOString().split('T')[0];

      if (!campaignMap[key]) {
        campaignMap[key] = {
          campaign: event.utm_campaign,
          source: event.utm_source,
          medium: event.utm_medium || 'N/A',
          events: 0,
          uniqueDays: new Set()
        };
      }

      campaignMap[key].events++;
      campaignMap[key].uniqueDays.add(date);
    });

    return Object.values(campaignMap)
      .map(campaign => ({
        campaign: campaign.campaign,
        source: campaign.source,
        medium: campaign.medium,
        totalEvents: campaign.events,
        activeDays: campaign.uniqueDays.size,
        avgEventsPerDay: campaign.uniqueDays.size > 0 
          ? (campaign.events / campaign.uniqueDays.size).toFixed(1)
          : '0'
      }))
      .sort((a, b) => b.totalEvents - a.totalEvents);
  } catch (err) {
    console.error('Error fetching campaign analytics:', err);
    throw err;
  }
};

/**
 * Fetch page performance analytics
 * Analyzes page visits, bounce rates, and user engagement
 */
export const fetchPagePerformance = async () => {
  try {
    const { data, error } = await supabase
      .from('user_analytics_events')
      .select('page_path, page_section, user_id, created_at, event_data')
      .not('page_path', 'is', null);

    if (error) {
      handleSupabaseError(error, 'fetch page performance');
    }

    // Group by page path and calculate metrics
    const pageMap: Record<string, {
      path: string;
      visits: number;
      uniqueUsers: Set<string>;
      sections: Set<string>;
      avgTimeOnPage?: number;
    }> = {};

    (data || []).forEach(event => {
      const path = event.page_path;

      if (!pageMap[path]) {
        pageMap[path] = {
          path,
          visits: 0,
          uniqueUsers: new Set(),
          sections: new Set()
        };
      }

      pageMap[path].visits++;
      pageMap[path].uniqueUsers.add(event.user_id);
      
      if (event.page_section) {
        pageMap[path].sections.add(event.page_section);
      }
    });

    return Object.values(pageMap)
      .map(page => ({
        path: page.path,
        visits: page.visits,
        uniqueUsers: page.uniqueUsers.size,
        sections: Array.from(page.sections),
        avgVisitsPerUser: page.uniqueUsers.size > 0 
          ? (page.visits / page.uniqueUsers.size).toFixed(1)
          : '0'
      }))
      .sort((a, b) => b.visits - a.visits);
  } catch (err) {
    console.error('Error fetching page performance:', err);
    throw err;
  }
};

/**
 * NEW: Fetch a specific user's session and all associated analytics events
 */
export const fetchUserSessionEvents = async (sessionId: string) => {
  try {
    // First, get the session with user data
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        id,
        user_id,
        started_at,
        last_active_at,
        ended_at,
        ip_address,
        user_agent,
        device_info,
        is_active,
        metadata,
        user_email,
        user_first_name,
        user_last_name,
        users (
          id,
          first_name,
          last_name,
          email,
          phone,
          user_type,
          has_active_subscription,
          created_at
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      handleSupabaseError(error, `fetch user session events for session ${sessionId}`);
    }

    if (!data) {
      return null;
    }

    // Get all analytics events for this session
    const { data: eventsData, error: eventsError } = await supabase
      .from('user_analytics_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    // Get user's subscription data
    const { data: subscriptionData, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        plan_id,
        status,
        current_period_end,
        plan_type,
        is_trial,
        subscription_plans (
          name,
          price,
          interval
        )
      `)
      .eq('user_id', data.users[0].id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
    }

    // Calculate page visits from events
    const events = eventsData || [];
    const pageVisitMap: Record<string, { count: number; lastVisited: string }> = {};
    
    events.forEach(event => {
      if (event.page_path) {
        if (!pageVisitMap[event.page_path]) {
          pageVisitMap[event.page_path] = { count: 0, lastVisited: event.created_at };
        }
        pageVisitMap[event.page_path].count++;
        if (new Date(event.created_at) > new Date(pageVisitMap[event.page_path].lastVisited)) {
          pageVisitMap[event.page_path].lastVisited = event.created_at;
        }
      }
    });

    const pageVisits = Object.entries(pageVisitMap).map(([path, data]) => ({
      page_path: path,
      visit_count: data.count,
      last_visited: data.lastVisited
    }));

    // Calculate session duration
    let sessionDuration: string | undefined;
    if (data.ended_at) {
      const start = new Date(data.started_at);
      const end = new Date(data.ended_at);
      const durationMs = end.getTime() - start.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      sessionDuration = `${minutes}m ${seconds}s`;
    }

    // Re-organize the data to match the SessionWithEvents interface
    const sessionWithEvents: SessionWithEvents = {
      sessionId: data.id,
      user: data.users,
      events: events,
      createdAt: data.started_at,
      subscription: subscriptionData ? {
        plan_id: subscriptionData.plan_id,
        status: subscriptionData.status,
        current_period_end: subscriptionData.current_period_end,
        plan_type: subscriptionData.plan_type,
        is_trial: subscriptionData.is_trial
      } : undefined,
      pageVisits: pageVisits.sort((a, b) => b.visit_count - a.visit_count),
      sessionStats: {
        total_events: events.length,
        session_duration: sessionDuration,
        unique_pages: Object.keys(pageVisitMap).length
      }
    };

    return sessionWithEvents;
  } catch (err) {
    console.error('Error fetching user session events:', err);
    throw err;
  }
};

/**
 * Fetch user journey analytics
 * Tracks user paths through the application
 */
export const fetchUserJourneys = async (userId?: string) => {
  try {
    let query = supabase
      .from('user_analytics_events')
      .select('user_id, page_path, event_action, created_at')
      .not('page_path', 'is', null)
      .order('created_at', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      handleSupabaseError(error, 'fetch user journeys');
    }

    // Group events by user to create journey paths
    const userJourneys: Record<string, Array<{
      path: string;
      action: string;
      timestamp: string;
    }>> = {};

    (data || []).forEach(event => {
      if (!userJourneys[event.user_id]) {
        userJourneys[event.user_id] = [];
      }

      userJourneys[event.user_id].push({
        path: event.page_path,
        action: event.event_action,
        timestamp: event.created_at
      });
    });

    return Object.entries(userJourneys).map(([userId, journey]) => ({
      userId,
      journey,
      totalSteps: journey.length,
      uniquePages: new Set(journey.map(step => step.path)).size
    }));
  } catch (err) {
    console.error('Error fetching user journeys:', err);
    throw err;
  }
};

/**
 * Fetch real-time analytics data
 * Gets recent events for live dashboard updates
 */
export const fetchRealtimeAnalytics = async (minutesBack: number = 30) => {
  try {
    const cutoffTime = new Date(Date.now() - minutesBack * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('user_analytics_events')
      .select(`
        *,
        users (
          first_name,
          last_name,
          user_type
        )
      `)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'fetch realtime analytics');
    }

    const events = data || [];
    const uniqueUsers = new Set(events.map(e => e.user_id)).size;
    const eventTypes = [...new Set(events.map(e => e.event_type))];

    return {
      recentEvents: events,
      totalEvents: events.length,
      uniqueActiveUsers: uniqueUsers,
      eventTypes,
      timeRange: `${minutesBack} minutes`,
      eventsPerMinute: events.length > 0 ? (events.length / minutesBack).toFixed(1) : '0'
    };
  } catch (err) {
    console.error('Error fetching realtime analytics:', err);
    throw err;
  }
};

/**
 * Health check function to verify database connectivity
 */
export const checkDatabaseHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    };
  } catch (err) {
    console.error('Database health check failed:', err);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      message: `Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    };
  }
};