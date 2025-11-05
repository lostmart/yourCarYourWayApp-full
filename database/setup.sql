-- ========================================
-- YOUR CAR YOUR WAY DATABASE SETUP
-- PostgreSQL 14+ Schema Definition
-- ========================================

-- Database: yourcarway
-- Description: Unified car rental application database
-- Author: Development Team
-- Date: 2025

-- ========================================
-- TABLE DEFINITIONS
-- ========================================

-- Users table
-- Stores customer account information and authentication data
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country CHAR(2),
    postal_code VARCHAR(20),
    preferred_language VARCHAR(5) DEFAULT 'en',
    preferred_currency CHAR(3) DEFAULT 'USD',
    email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agencies table
-- Stores rental agency location and operating information
CREATE TABLE agencies (
    agency_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country CHAR(2) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(20),
    email VARCHAR(255),
    operating_hours JSONB,
    services_offered JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
-- Stores vehicle inventory information with ACRISS classification
CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    acriss_code CHAR(4) NOT NULL,
    category VARCHAR(50) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    passenger_capacity INTEGER NOT NULL,
    luggage_capacity INTEGER,
    daily_rate DECIMAL(10,2) NOT NULL,
    features JSONB,
    availability_status VARCHAR(20) DEFAULT 'available',
    image_urls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_year CHECK (year >= 2000 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    CONSTRAINT chk_daily_rate CHECK (daily_rate > 0)
);

-- Reservations table
-- Stores customer booking information and rental details
CREATE TABLE reservations (
    reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
    pickup_agency_id UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE RESTRICT,
    return_agency_id UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE RESTRICT,
    pickup_datetime TIMESTAMP NOT NULL,
    return_datetime TIMESTAMP NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_id VARCHAR(255),
    reservation_status VARCHAR(20) DEFAULT 'confirmed',
    additional_drivers JSONB,
    optional_services JSONB,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    CONSTRAINT chk_dates CHECK (return_datetime > pickup_datetime),
    CONSTRAINT chk_total_amount CHECK (total_amount >= 0)
);

-- Support tickets table
-- Stores customer support requests and issue tracking
CREATE TABLE support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(reservation_id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    assigned_agent_id UUID,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Chat sessions table
-- Stores live chat session information between users and agents
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    agent_id UUID,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    session_status VARCHAR(20) DEFAULT 'active',
    rating INTEGER CHECK (rating BETWEEN 1 AND 5)
);

-- Chat messages table
-- Stores individual messages within chat sessions
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'agent')),
    sender_id UUID NOT NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    attachment_url VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ========================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Agency indexes
CREATE INDEX idx_agencies_country_city ON agencies(country, city);

-- Vehicle indexes
CREATE INDEX idx_vehicles_agency_id ON vehicles(agency_id);
CREATE INDEX idx_vehicles_availability ON vehicles(availability_status);
CREATE INDEX idx_vehicles_category ON vehicles(category);

-- Reservation indexes
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_dates ON reservations(pickup_datetime, return_datetime);
CREATE INDEX idx_reservations_status ON reservations(reservation_status);

-- Support ticket indexes
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Chat message indexes
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);

-- ========================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Trigger for agencies table
CREATE TRIGGER trigger_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Trigger for vehicles table
CREATE TRIGGER trigger_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Trigger for reservations table
CREATE TRIGGER trigger_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Trigger for support tickets table
CREATE TRIGGER trigger_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ========================================
-- SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT)
-- ========================================
-- Uncomment the following section to insert sample data for testing

/*
-- Sample user
INSERT INTO users (email, password_hash, first_name, last_name, email_verified) 
VALUES ('john.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIR.iem0uy', 'John', 'Doe', TRUE);

-- Sample agency
INSERT INTO agencies (agency_name, address_line1, city, country, phone, email)
VALUES ('London City Center', '123 Oxford Street', 'London', 'GB', '+44 20 7946 0958', 'london@yourcarway.com');

-- Sample vehicle
INSERT INTO vehicles (agency_id, make, model, year, acriss_code, category, transmission, fuel_type, passenger_capacity, daily_rate)
VALUES (
    (SELECT agency_id FROM agencies WHERE agency_name = 'London City Center'),
    'Toyota', 'Corolla', 2024, 'CDMR', 'Compact', 'Manual', 'Petrol', 5, 45.00
);
*/

-- ========================================
-- END OF SETUP SCRIPT
-- ========================================
-- To execute this script:
-- psql -U postgres -d yourcarway -f setup.sql