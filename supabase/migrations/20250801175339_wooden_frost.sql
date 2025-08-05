-- SQL Commands for User, Session, Analytics, and Subscription Tables

-- =================================================================
-- I. DROP EXISTING TABLES
--
-- The following commands will remove the existing tables.
-- This is useful for a clean reset of the database schema.
-- The "IF EXISTS" clause prevents errors if the tables don't exist.
-- =================================================================

DROP TABLE IF EXISTS user_analytics_events;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS user_type_enum;


-- =================================================================
-- II. CREATE NEW TABLES
--
-- The following commands create the tables with the updated schema,
-- including the new columns as requested.
-- =================================================================

-- Create a custom user type for the 'users' table
CREATE TYPE user_type_enum AS ENUM ('student', 'teacher', 'admin', 'guest');

-- Table: users
-- Stores core information about each user.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    first_name TEXT,
    last_name TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    user_type user_type_enum,
    has_active_subscription BOOLEAN DEFAULT FALSE,
    subscription_plan TEXT,
    stripe_customer_id TEXT,
    subscription_status TEXT,
    subscription_plan_id TEXT,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_next_billing_date TIMESTAMP WITH TIME ZONE,
    subscription_amount NUMERIC,
    subscription_interval TEXT
);

-- Table: user_sessions
-- Tracks user login sessions.
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    user_email TEXT,
    user_first_name TEXT,
    user_last_name TEXT
);

-- Table: user_analytics_events
-- Logs various user interaction events for analytics.
CREATE TABLE user_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_category TEXT,
    event_action TEXT,
    page_path TEXT,
    page_title TEXT,
    page_section TEXT,
    event_data JSONB,
    duration_seconds INTEGER,
    value_numeric INTEGER,
    value_text TEXT,
    user_agent TEXT,
    viewport_width INTEGER,
    viewport_height INTEGER,
    device_type TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    consent_given BOOLEAN DEFAULT FALSE,
    anonymized BOOLEAN DEFAULT FALSE,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: subscription_plans
-- Defines the available subscription plans.
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    interval TEXT NOT NULL, -- e.g., 'month', 'year'
    features JSONB,
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    plan_type TEXT, -- e.g., 'basic', 'premium', 'enterprise'
    is_active BOOLEAN DEFAULT TRUE,
    student_limit INTEGER,
    student_price NUMERIC(10, 2)
);


-- Table: subscriptions
-- Manages user subscriptions to various plans.
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    plan_type TEXT,
    status TEXT NOT NULL, -- e.g., 'active', 'canceled', 'trialing'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_subscription JSONB,
    checkout_session_id TEXT,
    checkout_expires_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    is_trial BOOLEAN DEFAULT FALSE,
    student_count INTEGER
);


-- =================================================================
-- III. INSERT FAKE DATA
--
-- The following commands populate the tables with sample data.
-- This helps in testing and development.
-- =================================================================

-- Insert data into 'users'
INSERT INTO users (id, email, phone, first_name, last_name, street_address, city, state, zip, country, user_type, has_active_subscription, subscription_plan, stripe_customer_id, subscription_status, subscription_plan_id, subscription_start_date, subscription_next_billing_date, subscription_amount, subscription_interval) VALUES
(gen_random_uuid(), 'john.doe@example.com', '123-456-7890', 'John', 'Doe', '123 Maple Street', 'Anytown', 'CA', '12345', 'USA', 'student', TRUE, 'Premium', 'cus_123abc', 'active', 'plan_premium_1', '2023-01-15', '2024-01-15', 99.99, 'yearly'),
(gen_random_uuid(), 'jane.smith@example.com', '987-654-3210', 'Jane', 'Smith', '456 Oak Avenue', 'Someville', 'NY', '54321', 'USA', 'teacher', TRUE, 'Basic', 'cus_456def', 'active', 'plan_basic_1', '2023-03-20', '2023-04-20', 19.99, 'monthly'),
(gen_random_uuid(), 'alice.jones@example.com', '555-123-4567', 'Alice', 'Jones', '789 Pine Lane', 'Metropolis', 'IL', '67890', 'USA', 'admin', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'bob.williams@example.com', '555-987-6543', 'Bob', 'Williams', '101 Elm Court', 'Gotham', 'NJ', '09876', 'USA', 'guest', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'charlie.brown@example.com', '222-333-4444', 'Charlie', 'Brown', '212 Birch Road', 'Springfield', 'OR', '11223', 'USA', 'student', TRUE, 'Premium', 'cus_789ghi', 'trialing', 'plan_premium_1', '2023-04-01', '2023-04-15', 0.00, 'monthly'),
(gen_random_uuid(), 'diana.prince@example.com', '333-444-5555', 'Diana', 'Prince', '321 Cedar Street', 'Themyscira', 'DC', '22334', 'USA', 'teacher', TRUE, 'Basic', 'cus_101jkl', 'active', 'plan_basic_1', '2022-11-10', '2023-11-10', 199.99, 'yearly'),
(gen_random_uuid(), 'peter.parker@example.com', '444-555-6666', 'Peter', 'Parker', '432 Spruce Avenue', 'New York', 'NY', '33445', 'USA', 'student', FALSE, NULL, NULL, 'canceled', 'plan_basic_1', '2022-09-01', '2022-10-01', 19.99, 'monthly'),
(gen_random_uuid(), 'lois.lane@example.com', '666-777-8888', 'Lois', 'Lane', '543 Redwood Blvd', 'Metropolis', 'IL', '44556', 'USA', 'admin', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'clark.kent@example.com', '777-888-9999', 'Clark', 'Kent', '654 Willow Way', 'Smallville', 'KS', '55667', 'USA', 'guest', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'bruce.wayne@example.com', '888-999-0000', 'Bruce', 'Wayne', '765 Gotham Manor', 'Gotham', 'NJ', '66778', 'USA', 'teacher', TRUE, 'Premium', 'cus_mno456', 'active', 'plan_premium_1', '2021-05-20', '2024-05-20', 999.99, 'yearly'),
(gen_random_uuid(), 'selina.kyle@example.com', '111-222-3333', 'Selina', 'Kyle', '876 Park Avenue', 'Gotham', 'NJ', '77889', 'USA', 'student', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'harvey.dent@example.com', '999-000-1111', 'Harvey', 'Dent', '987 Justice Street', 'Gotham', 'NJ', '88990', 'USA', 'admin', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'james.gordon@example.com', '000-111-2222', 'James', 'Gordon', '111 GCPD Plaza', 'Gotham', 'NJ', '99001', 'USA', 'teacher', TRUE, 'Basic', 'cus_pqr789', 'active', 'plan_basic_1', '2023-02-28', '2023-03-28', 19.99, 'monthly'),
(gen_random_uuid(), 'oswald.cobblepot@example.com', '121-212-3434', 'Oswald', 'Cobblepot', '222 Iceberg Lounge', 'Gotham', 'NJ', '10112', 'USA', 'guest', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'edward.nygma@example.com', '343-434-5656', 'Edward', 'Nygma', '333 Riddle Factory', 'Gotham', 'NJ', '12131', 'USA', 'student', TRUE, 'Premium', 'cus_stu101', 'past_due', 'plan_premium_1', '2023-03-05', '2023-04-05', 99.99, 'monthly'),
(gen_random_uuid(), 'pamela.isley@example.com', '565-656-7878', 'Pamela', 'Isley', '444 Botanical Gardens', 'Gotham', 'NJ', '14151', 'USA', 'teacher', TRUE, 'Basic', 'cus_vwx202', 'active', 'plan_basic_1', '2023-01-01', '2024-01-01', 199.99, 'yearly'),
(gen_random_uuid(), 'victor.fries@example.com', '787-878-9090', 'Victor', 'Fries', '555 Cryo-Lab', 'Gotham', 'NJ', '16171', 'USA', 'student', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL),
(gen_random_uuid(), 'barbara.gordon@example.com', '909-090-1212', 'Barbara', 'Gordon', '666 Clock Tower', 'Gotham', 'NJ', '18191', 'USA', 'admin', TRUE, 'Premium', 'cus_yza303', 'active', 'plan_premium_1', '2022-08-15', '2023-08-15', 99.99, 'yearly'),
(gen_random_uuid(), 'dick.grayson@example.com', '123-321-4567', 'Dick', 'Grayson', '777 Bludhaven Apts', 'Bludhaven', 'NJ', '20212', 'USA', 'student', TRUE, 'Basic', 'cus_bcd404', 'active', 'plan_basic_1', '2023-04-10', '2023-05-10', 19.99, 'monthly'),
(gen_random_uuid(), 'jason.todd@example.com', '456-654-7890', 'Jason', 'Todd', '888 Crime Alley', 'Gotham', 'NJ', '22232', 'USA', 'guest', FALSE, NULL, NULL, 'inactive', NULL, NULL, NULL, NULL, NULL);

-- Insert data into 'user_sessions'
-- Note: We'll need to fetch user_ids from the 'users' table to insert here.
-- For simplicity in this script, we'll use a subquery.
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', '{"os": "Windows", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'john.doe@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '10.0.0.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15', '{"os": "macOS", "browser": "Safari"}', TRUE, email, first_name, last_name FROM users WHERE email = 'jane.smith@example.com' LIMIT 1;
-- ... repeat for other users, here are a few more examples
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '172.16.0.5', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1', '{"os": "iOS", "browser": "Safari"}', FALSE, email, first_name, last_name FROM users WHERE email = 'alice.jones@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.100', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36', '{"os": "Linux", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'charlie.brown@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', '{"os": "Windows", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'diana.prince@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '10.0.0.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15', '{"os": "macOS", "browser": "Safari"}', TRUE, email, first_name, last_name FROM users WHERE email = 'peter.parker@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '172.16.0.10', 'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0', '{"os": "Android", "browser": "Firefox"}', FALSE, email, first_name, last_name FROM users WHERE email = 'lois.lane@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', '{"os": "Windows", "browser": "Firefox"}', TRUE, email, first_name, last_name FROM users WHERE email = 'bruce.wayne@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '10.0.0.15', 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1', '{"os": "iOS", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'selina.kyle@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '172.16.0.20', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0', '{"os": "Ubuntu", "browser": "Firefox"}', FALSE, email, first_name, last_name FROM users WHERE email = 'harvey.dent@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.110', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', '{"os": "Windows 7", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'james.gordon@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '10.0.0.25', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', '{"os": "macOS", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'pamela.isley@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '172.16.0.30', 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36', '{"os": "Android", "browser": "Chrome"}', FALSE, email, first_name, last_name FROM users WHERE email = 'victor.fries@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.115', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59', '{"os": "Windows", "browser": "Edge"}', TRUE, email, first_name, last_name FROM users WHERE email = 'barbara.gordon@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '10.0.0.35', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1', '{"os": "iOS", "browser": "Safari"}', TRUE, email, first_name, last_name FROM users WHERE email = 'dick.grayson@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '172.16.0.40', 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0', '{"os": "Fedora", "browser": "Firefox"}', FALSE, email, first_name, last_name FROM users WHERE email = 'jason.todd@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.120', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', '{"os": "macOS Big Sur", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'edward.nygma@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '10.0.0.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.277', '{"os": "Windows", "browser": "Opera"}', TRUE, email, first_name, last_name FROM users WHERE email = 'oswald.cobblepot@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '172.16.0.50', 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36', '{"os": "Android", "browser": "Chrome"}', TRUE, email, first_name, last_name FROM users WHERE email = 'clark.kent@example.com' LIMIT 1;
INSERT INTO user_sessions (user_id, ip_address, user_agent, device_info, is_active, user_email, user_first_name, user_last_name)
SELECT id, '192.168.1.125', 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko', '{"os": "Windows", "browser": "IE11"}', FALSE, email, first_name, last_name FROM users WHERE email = 'bob.williams@example.com' LIMIT 1;


-- Insert data into 'user_analytics_events'
-- This requires both user_id and session_id.
INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'page_view', 'navigation', 'view', '/dashboard', 'User Dashboard', 'main_content', '{"referrer": "google.com"}', 'google', 'organic', 'summer_sale', 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'john.doe@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'button_click', 'engagement', 'click', '/pricing', 'Pricing Page', 'cta_section', '{"button_id": "subscribe_premium"}', 'facebook', 'cpc', 'new_features_q2', 'mobile'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'jane.smith@example.com' LIMIT 1;

-- ... repeat for other users and event types
INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'video_play', 'media', 'play', '/tutorials/getting-started', 'Getting Started Video', 'video_player', '{"video_id": "vid_123", "duration": 360}', 'youtube', 'referral', 'tutorial_series', 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'charlie.brown@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'form_submission', 'conversion', 'submit', '/contact', 'Contact Us', 'contact_form', '{"form_id": "support_request"}', 'internal', 'email', 'newsletter_apr', 'tablet'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'diana.prince@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'logout', 'authentication', 'logout', '/logout', 'Logout Page', 'header', '{}', NULL, NULL, NULL, 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'peter.parker@example.com' LIMIT 1;

-- ... (add 15 more varied analytic events)
INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'search', 'engagement', 'query', '/search', 'Search Results', 'search_bar', '{"query": "how to use feature x"}', NULL, NULL, NULL, 'mobile'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'bruce.wayne@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'add_to_cart', 'ecommerce', 'click', '/products/1', 'Product Page', 'buy_box', '{"product_id": "prod_abc"}', 'google', 'cpc', 'spring_promo', 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'selina.kyle@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'page_view', 'navigation', 'view', '/features', 'Features', 'main_content', '{}', 'twitter', 'social', 'feature_launch', 'tablet'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'james.gordon@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'download', 'engagement', 'click', '/resources/whitepaper.pdf', 'Whitepaper', 'resource_link', '{"file_name": "whitepaper.pdf"}', 'linkedin', 'cpc', 'b2b_campaign', 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'pamela.isley@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'comment', 'social', 'post', '/blog/new-post', 'Blog Post', 'comments_section', '{"comment_length": 150}', NULL, NULL, NULL, 'mobile'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'barbara.gordon@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'upgrade_subscription', 'conversion', 'click', '/account/billing', 'Billing', 'upgrade_button', '{"from_plan": "basic", "to_plan": "premium"}', 'email', 'newsletter', 'upsell_q2', 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'dick.grayson@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'page_scroll', 'engagement', 'scroll', '/blog/long-article', 'Long Article', 'article_body', '{"scroll_depth": 90}', NULL, NULL, NULL, 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'john.doe@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'login_failed', 'authentication', 'attempt', '/login', 'Login Page', 'login_form', '{"reason": "wrong_password"}', NULL, NULL, NULL, 'mobile'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'jason.todd@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'share', 'social', 'click', '/blog/new-post', 'Blog Post', 'share_buttons', '{"platform": "twitter"}', NULL, NULL, NULL, 'tablet'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'jane.smith@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'page_view', 'navigation', 'view', '/about', 'About Us', 'main_content', '{}', 'google', 'organic', 'brand_awareness', 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'bruce.wayne@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'video_complete', 'media', 'complete', '/tutorials/getting-started', 'Getting Started Video', 'video_player', '{"video_id": "vid_123"}', 'youtube', 'referral', 'tutorial_series', 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'charlie.brown@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'cancel_subscription', 'churn', 'click', '/account/billing', 'Billing', 'cancel_button', '{"plan": "premium"}', NULL, NULL, NULL, 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'peter.parker@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'page_view', 'navigation', 'view', '/', 'Home Page', 'hero_section', '{}', 'direct', 'none', 'homepage_traffic', 'mobile'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'diana.prince@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'button_click', 'engagement', 'click', '/features', 'Features Page', 'feature_list', '{"feature_id": "feature_3"}', NULL, NULL, NULL, 'desktop'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'james.gordon@example.com' LIMIT 1;

INSERT INTO user_analytics_events (user_id, session_id, event_type, event_category, event_action, page_path, page_title, page_section, event_data, utm_source, utm_medium, utm_campaign, device_type)
SELECT u.id, s.id, 'form_start', 'engagement', 'focus', '/signup', 'Signup Page', 'signup_form', '{"form_id": "new_user_signup"}', 'google', 'cpc', 'lead_gen_q2', 'mobile'
FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE u.email = 'pamela.isley@example.com' LIMIT 1;


-- Insert data into 'subscription_plans'
INSERT INTO subscription_plans (id, name, description, price, interval, features, stripe_price_id, stripe_product_id, plan_type, is_active, student_limit, student_price) VALUES
('plan_basic_1', 'Basic Plan', 'Access to core features for individuals.', 19.99, 'month', '["Feature A", "Feature B"]', 'price_1Lq...', 'prod_1Lq...', 'basic', TRUE, 1, 9.99),
('plan_premium_1', 'Premium Plan', 'Advanced features for power users.', 99.99, 'month', '["Feature A", "Feature B", "Feature C", "Analytics"]', 'price_2Mr...', 'prod_2Mr...', 'premium', TRUE, 1, 49.99),
('plan_basic_yr_1', 'Basic Yearly', 'Get 2 months free with our annual plan.', 199.99, 'year', '["Feature A", "Feature B"]', 'price_3Ns...', 'prod_1Lq...', 'basic', TRUE, 1, 99.99),
('plan_premium_yr_1', 'Premium Yearly', 'Best value for power users.', 999.99, 'year', '["Feature A", "Feature B", "Feature C", "Analytics"]', 'price_4Ot...', 'prod_2Mr...', 'premium', TRUE, 1, 499.99),
('plan_team_1', 'Team Plan', 'Collaborate with your team.', 249.99, 'month', '["All Premium Features", "Team Management", "Priority Support"]', 'price_5Pu...', 'prod_5Pu...', 'team', TRUE, 10, 24.99),
('plan_enterprise_1', 'Enterprise Plan', 'Custom solutions for large organizations.', 4999.99, 'year', '["All Team Features", "SLA", "Dedicated Account Manager"]', 'price_6Qv...', 'prod_6Qv...', 'enterprise', TRUE, 100, 49.99),
('plan_free_1', 'Free Plan', 'Basic features to get you started.', 0.00, 'month', '["Limited Feature A"]', 'price_7Rw...', 'prod_7Rw...', 'free', TRUE, 1, 0.00),
('plan_edu_1', 'Education Plan', 'For schools and universities.', 49.99, 'month', '["All Premium Features", "Classroom Management"]', 'price_8Sx...', 'prod_8Sx...', 'education', TRUE, 30, 1.99),
('plan_edu_yr_1', 'Education Yearly', 'Annual plan for educational institutions.', 499.99, 'year', '["All Premium Features", "Classroom Management"]', 'price_9Ty...', 'prod_8Sx...', 'education', TRUE, 30, 19.99),
('plan_pro_1', 'Pro Plan', 'For professionals needing more.', 49.99, 'month', '["All Basic Features", "Pro Toolset"]', 'price_1Uz...', 'prod_1Uz...', 'pro', TRUE, 1, 24.99),
('plan_pro_yr_1', 'Pro Yearly', 'Annual Pro plan.', 499.99, 'year', '["All Basic Features", "Pro Toolset"]', 'price_2Va...', 'prod_1Uz...', 'pro', TRUE, 1, 249.99),
('plan_basic_trial', 'Basic Trial', '14-day free trial of the Basic plan.', 0.00, 'day', '["Feature A", "Feature B"]', 'price_3Wb...', 'prod_1Lq...', 'basic', TRUE, 1, 0.00),
('plan_premium_trial', 'Premium Trial', '14-day free trial of the Premium plan.', 0.00, 'day', '["Feature A", "Feature B", "Feature C", "Analytics"]', 'price_4Xc...', 'prod_2Mr...', 'premium', TRUE, 1, 0.00),
('plan_legacy_1', 'Legacy Basic', 'Old basic plan, no longer offered.', 9.99, 'month', '["Feature A"]', 'price_5Yd...', 'prod_5Yd...', 'basic', FALSE, 1, 4.99),
('plan_legacy_2', 'Legacy Premium', 'Old premium plan, no longer offered.', 49.99, 'month', '["Feature A", "Feature C"]', 'price_6Ze...', 'prod_6Ze...', 'premium', FALSE, 1, 24.99),
('plan_nonprofit_1', 'Non-Profit Plan', 'Discounted plan for non-profits.', 29.99, 'month', '["All Premium Features", "Donation Tools"]', 'price_7Af...', 'prod_7Af...', 'nonprofit', TRUE, 5, 5.99),
('plan_nonprofit_yr_1', 'Non-Profit Yearly', 'Annual plan for non-profits.', 299.99, 'year', '["All Premium Features", "Donation Tools"]', 'price_8Bg...', 'prod_7Af...', 'nonprofit', TRUE, 5, 59.99),
('plan_dev_1', 'Developer Plan', 'For developers integrating with our API.', 9.99, 'month', '["API Access", "Sandbox Environment"]', 'price_9Ch...', 'prod_9Ch...', 'developer', TRUE, 1, 4.99),
('plan_personal_1', 'Personal Plan', 'Simple plan for personal projects.', 4.99, 'month', '["Limited Feature A", "1 Project"]', 'price_1Di...', 'prod_1Di...', 'personal', TRUE, 1, 2.49),
('plan_startup_1', 'Startup Plan', 'Special offer for new startups.', 79.99, 'month', '["All Team Features", "Mentorship"]', 'price_2Ej...', 'prod_2Ej...', 'startup', TRUE, 5, 15.99);


-- Insert data into 'subscriptions'
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_premium_1', 'cus_123abc', 'sub_123', 'premium', 'active', '2024-01-15', FALSE, 1 FROM users WHERE email = 'john.doe@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_basic_1', 'cus_456def', 'sub_456', 'basic', 'active', '2023-04-20', FALSE, 1 FROM users WHERE email = 'jane.smith@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_premium_trial', 'cus_789ghi', 'sub_789', 'premium', 'trialing', '2023-04-15', TRUE, 1 FROM users WHERE email = 'charlie.brown@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, canceled_at, cancel_at_period_end, is_trial, student_count)
SELECT id, 'plan_basic_1', NULL, 'sub_abc', 'basic', 'canceled', '2022-10-01', '2022-09-15', TRUE, FALSE, 1 FROM users WHERE email = 'peter.parker@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_premium_yr_1', 'cus_mno456', 'sub_def', 'premium', 'active', '2024-05-20', FALSE, 1 FROM users WHERE email = 'bruce.wayne@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_basic_1', 'cus_pqr789', 'sub_ghi', 'basic', 'active', '2023-03-28', FALSE, 1 FROM users WHERE email = 'james.gordon@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_premium_1', 'cus_stu101', 'sub_jkl', 'premium', 'past_due', '2023-04-05', FALSE, 1 FROM users WHERE email = 'edward.nygma@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_basic_yr_1', 'cus_vwx202', 'sub_mno', 'basic', 'active', '2024-01-01', FALSE, 1 FROM users WHERE email = 'pamela.isley@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_premium_yr_1', 'cus_yza303', 'sub_pqr', 'premium', 'active', '2023-08-15', FALSE, 1 FROM users WHERE email = 'barbara.gordon@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_basic_1', 'cus_bcd404', 'sub_stu', 'basic', 'active', '2023-05-10', FALSE, 1 FROM users WHERE email = 'dick.grayson@example.com';
-- (add 10 more varied subscriptions)
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_edu_1', 'cus_edu1', 'sub_edu1', 'education', 'active', '2023-05-15', FALSE, 25 FROM users WHERE email = 'diana.prince@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_free_1', 'cus_free1', 'sub_free1', 'free', 'active', NULL, FALSE, 1 FROM users WHERE email = 'selina.kyle@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, canceled_at, cancel_at_period_end, is_trial, student_count)
SELECT id, 'plan_team_1', 'cus_team1', 'sub_team1', 'team', 'canceled', '2023-03-01', '2023-02-20', TRUE, FALSE, 8 FROM users WHERE email = 'lois.lane@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_pro_yr_1', 'cus_pro1', 'sub_pro1', 'pro', 'active', '2024-02-01', FALSE, 1 FROM users WHERE email = 'clark.kent@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_startup_1', 'cus_start1', 'sub_start1', 'startup', 'trialing', '2023-04-25', TRUE, 4 FROM users WHERE email = 'bob.williams@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_legacy_1', 'cus_legacy1', 'sub_legacy1', 'basic', 'active', '2023-05-01', FALSE, 1 FROM users WHERE email = 'harvey.dent@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_nonprofit_1', 'cus_np1', 'sub_np1', 'nonprofit', 'active', '2023-05-18', FALSE, 3 FROM users WHERE email = 'oswald.cobblepot@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_dev_1', 'cus_dev1', 'sub_dev1', 'developer', 'active', '2023-05-20', FALSE, 1 FROM users WHERE email = 'victor.fries@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_personal_1', 'cus_pers1', 'sub_pers1', 'personal', 'active', '2023-05-22', FALSE, 1 FROM users WHERE email = 'jason.todd@example.com';
INSERT INTO subscriptions (user_id, plan_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end, is_trial, student_count)
SELECT id, 'plan_edu_yr_1', 'cus_edu2', 'sub_edu2', 'education', 'active', '2024-03-10', FALSE, 28 FROM users WHERE email = 'alice.jones@example.com';


-- =================================================================
-- IV. JOINED TABLE QUERY
--
-- This query fetches meaningful data by joining the users,
-- user_sessions, and user_analytics_events tables.
-- =================================================================

SELECT
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.user_type,
    u.has_active_subscription,
    s.is_active AS session_is_active,
    a.event_type,
    a.event_category,
    a.event_action,
    a.page_path,
    a.page_section,
    a.event_data,
    a.utm_campaign,
    a.utm_source,
    a.utm_medium
FROM
    users u
LEFT JOIN
    user_sessions s ON u.id = s.user_id
LEFT JOIN
    user_analytics_events a ON u.id = a.user_id AND s.id = a.session_id
WHERE
    -- Example filter: only show users who have had some activity
    a.id IS NOT NULL
ORDER BY
    u.last_name, u.first_name, a.event_timestamp DESC;

