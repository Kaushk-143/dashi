// Enum for user_type
export type UserType = 'student' | 'teacher' | 'admin' | 'guest';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  user_type: UserType;
  has_active_subscription: boolean;
  subscription_plan: string | null;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  subscription_plan_id: string | null;
  subscription_start_date: string | null;
  subscription_next_billing_date: string | null;
  subscription_amount: number | null;
  subscription_interval: string | null;
}

export interface UserSession {
  id: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_category: string;
  event_action: string;
  event_path?: string;
  page_section?: string;
  event_data?: Record<string, any>;
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  created_at: string;
}

export interface UserWithSession extends User {
  user_sessions: UserSession[];
}

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  subscriptionBreakdown: {
    active: number; // This is what's being displayed
    inactive: number;
  };
  userTypeBreakdown: {
    standard: number;
    premium: number;
  };
}

export interface EventAnalytics {
  eventType: string;
  count: number;
  date: string;
}

export interface TrafficSource {
  utm_source: string;
  utm_medium?: string;
  utm_campaign?: string;
  count: number;
}

export interface PageAnalytics {
  page_path: string;
  visits: number;
  unique_users: number;
}

// NEW: Interface for the detailed session view
export interface SessionWithEvents {
  sessionId: string;
  user: User;
  events: UserAnalyticsEvent[];
  createdAt: string;
  subscription?: {
    plan_id: string;
    status: string;
    current_period_end: string;
    plan_type: string;
    is_trial: boolean;
  };
  pageVisits: Array<{
    page_path: string;
    visit_count: number;
    last_visited: string;
  }>;
  sessionStats: {
    total_events: number;
    session_duration?: string;
    unique_pages: number;
  };
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string; // Use plan_id, not subscription_plan_id
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  raw_subscription: any | null;
  checkout_session_id: string | null;
  checkout_expires_at: string | null;
  cancellation_reason: string | null;
  trial_start: string | null;
  trial_end: string | null;
  is_trial: boolean;
  student_count: number | null;
}