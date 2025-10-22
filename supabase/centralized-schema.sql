-- CENTRALIZED MULTI-USER SUPABASE SCHEMA
-- Complete database schema for synchronized multi-user delivery tracking
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table (enhanced for multi-user)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    warehouse_name TEXT DEFAULT 'SMEG warehouse',
    phone TEXT,
    role TEXT DEFAULT 'user', -- 'admin', 'manager', 'user'
    preferences JSONB DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Deliveries table with better field mapping
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dr_number TEXT NOT NULL,
    customer_name TEXT,
    vendor_number TEXT,
    origin TEXT,
    destination TEXT,
    truck_type TEXT,
    truck_plate_number TEXT,
    status TEXT DEFAULT 'On Schedule',
    distance TEXT,
    additional_costs DECIMAL(10,2) DEFAULT 0.00,
    
    -- Enhanced date/time fields
    delivery_date DATE DEFAULT CURRENT_DATE,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional delivery details
    item_number TEXT,
    item_description TEXT,
    serial_number TEXT,
    mobile_number TEXT,
    
    -- System fields
    created_by TEXT DEFAULT 'System',
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    
    -- Additional data as JSON for flexibility
    additional_data JSONB DEFAULT '{}',
    
    -- Sync tracking
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1
);

-- Delivery History table (for completed deliveries)
CREATE TABLE IF NOT EXISTS public.delivery_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
    dr_number TEXT NOT NULL,
    customer_name TEXT,
    vendor_number TEXT,
    origin TEXT,
    destination TEXT,
    truck_type TEXT,
    truck_plate_number TEXT,
    status TEXT DEFAULT 'Completed',
    
    -- Completion details
    completed_date DATE DEFAULT CURRENT_DATE,
    completed_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_timestamp TEXT,
    signature_data TEXT,
    
    -- Original delivery data preserved
    original_data JSONB,
    
    -- System fields
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile_number TEXT,
    address TEXT,
    vendor_number TEXT,
    
    -- Additional customer details
    contact_person TEXT,
    company_type TEXT,
    notes TEXT,
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    
    -- Sync tracking
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1
);

-- Additional Cost Items table
CREATE TABLE IF NOT EXISTS public.additional_cost_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
    dr_number TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    category TEXT, -- 'fuel', 'toll', 'helper', 'special_handling', 'other'
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- E-POD records table (enhanced)
CREATE TABLE IF NOT EXISTS public.epod_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id UUID REFERENCES public.deliveries(id),
    dr_number TEXT NOT NULL,
    customer_name TEXT,
    customer_contact TEXT,
    vendor_number TEXT,
    truck_plate TEXT,
    origin TEXT,
    destination TEXT,
    
    -- Signature details
    signature_data TEXT,
    signature_type TEXT DEFAULT 'digital', -- 'digital', 'physical', 'group'
    signed_by TEXT,
    
    -- Status and timing
    status TEXT DEFAULT 'Completed',
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- System fields
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings/Calendar table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    status TEXT DEFAULT 'Scheduled',
    
    -- Booking details
    booking_type TEXT DEFAULT 'delivery', -- 'delivery', 'pickup', 'maintenance'
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Real-time sync queue for offline operations
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    record_id TEXT,
    data JSONB,
    
    -- Processing status
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Activity log for audit trail
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'sign', 'complete'
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON public.deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_dr_number ON public.deliveries(dr_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON public.deliveries(created_at);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date ON public.deliveries(delivery_date);

CREATE INDEX IF NOT EXISTS idx_delivery_history_user_id ON public.delivery_history(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_history_dr_number ON public.delivery_history(dr_number);
CREATE INDEX IF NOT EXISTS idx_delivery_history_completed_date ON public.delivery_history(completed_date);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_vendor_number ON public.customers(vendor_number);

CREATE INDEX IF NOT EXISTS idx_additional_cost_items_delivery_id ON public.additional_cost_items(delivery_id);
CREATE INDEX IF NOT EXISTS idx_additional_cost_items_dr_number ON public.additional_cost_items(dr_number);

CREATE INDEX IF NOT EXISTS idx_epod_records_user_id ON public.epod_records(user_id);
CREATE INDEX IF NOT EXISTS idx_epod_records_dr_number ON public.epod_records(dr_number);
CREATE INDEX IF NOT EXISTS idx_epod_records_signed_at ON public.epod_records(signed_at);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON public.bookings(start_date);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON public.sync_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at);

-- Row Level Security Policies (Multi-user support)

-- User Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Deliveries (Users can only see their own data)
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deliveries" ON public.deliveries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deliveries" ON public.deliveries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliveries" ON public.deliveries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deliveries" ON public.deliveries
    FOR DELETE USING (auth.uid() = user_id);

-- Delivery History
ALTER TABLE public.delivery_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own delivery history" ON public.delivery_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own delivery history" ON public.delivery_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customers" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
    FOR DELETE USING (auth.uid() = user_id);

-- Additional Cost Items
ALTER TABLE public.additional_cost_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cost items" ON public.additional_cost_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cost items" ON public.additional_cost_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- E-POD Records
ALTER TABLE public.epod_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own epod records" ON public.epod_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own epod records" ON public.epod_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" ON public.bookings
    FOR DELETE USING (auth.uid() = user_id);

-- Sync Queue
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync queue" ON public.sync_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync queue" ON public.sync_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync queue" ON public.sync_queue
    FOR UPDATE USING (auth.uid() = user_id);

-- Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON public.activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON public.activity_log
    FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at 
    BEFORE UPDATE ON public.deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, email, warehouse_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        'SMEG warehouse'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_log (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging to key tables
CREATE TRIGGER deliveries_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON public.deliveries
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER customers_activity_log
    AFTER INSERT OR UPDATE OR DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Views for easier data access
CREATE OR REPLACE VIEW public.active_deliveries AS
SELECT * FROM public.deliveries 
WHERE status NOT IN ('Completed', 'Signed')
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW public.completed_deliveries AS
SELECT * FROM public.deliveries 
WHERE status IN ('Completed', 'Signed')
ORDER BY completed_at DESC;

-- Function to get delivery statistics
CREATE OR REPLACE FUNCTION public.get_delivery_stats(user_uuid UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_deliveries', COUNT(*),
        'active_deliveries', COUNT(*) FILTER (WHERE status NOT IN ('Completed', 'Signed')),
        'completed_deliveries', COUNT(*) FILTER (WHERE status IN ('Completed', 'Signed')),
        'completion_rate', ROUND(
            (COUNT(*) FILTER (WHERE status IN ('Completed', 'Signed'))::DECIMAL / 
             NULLIF(COUNT(*), 0) * 100), 2
        )
    ) INTO stats
    FROM public.deliveries
    WHERE user_id = user_uuid;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default user profiles for existing users
INSERT INTO public.user_profiles (id, full_name, email, warehouse_name)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email),
    email,
    'SMEG warehouse'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Centralized multi-user database schema created successfully!';
    RAISE NOTICE 'Tables created: user_profiles, deliveries, delivery_history, customers, additional_cost_items, epod_records, bookings, sync_queue, activity_log';
    RAISE NOTICE 'Row Level Security enabled for multi-user data isolation';
    RAISE NOTICE 'Real-time subscriptions ready for live data synchronization';
END $$;