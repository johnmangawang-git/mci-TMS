-- IMMEDIATE ERROR FIXES
-- Run this in Supabase SQL Editor to fix current errors

-- Fix 1: Ensure deliveries table exists with basic structure
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
    delivery_date DATE DEFAULT CURRENT_DATE,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    item_number TEXT,
    item_description TEXT,
    serial_number TEXT,
    mobile_number TEXT,
    created_by TEXT DEFAULT 'System',
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    additional_data JSONB DEFAULT '{}',
    signature_data TEXT
);

-- Fix 2: Ensure customers table exists
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile_number TEXT,
    address TEXT,
    vendor_number TEXT,
    contact_person TEXT,
    company_type TEXT,
    account_type TEXT DEFAULT 'Individual',
    notes TEXT,
    status TEXT DEFAULT 'active',
    bookings_count INTEGER DEFAULT 0,
    last_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Fix 3: Ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    warehouse_name TEXT DEFAULT 'SMEG warehouse',
    phone TEXT,
    role TEXT DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix 4: Remove problematic unique constraints
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_dr_number_key;

-- Fix 5: Enable RLS on all tables
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Fix 6: Create basic RLS policies (with proper syntax)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can manage their own deliveries" ON public.deliveries;
    DROP POLICY IF EXISTS "Users can manage their own customers" ON public.customers;
    DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
    
    -- Create new policies
    CREATE POLICY "Users can manage their own deliveries" ON public.deliveries
        FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage their own customers" ON public.customers
        FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Users can manage their own profile" ON public.user_profiles
        FOR ALL USING (auth.uid() = id);
        
    RAISE NOTICE '✅ RLS policies created successfully';
END $$;

-- Fix 7: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON public.deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_dr_number ON public.deliveries(dr_number);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🚨 IMMEDIATE ERROR FIXES APPLIED!';
    RAISE NOTICE '✅ Basic tables created with required fields';
    RAISE NOTICE '✅ Problematic constraints removed';
    RAISE NOTICE '✅ RLS enabled for security';
    RAISE NOTICE '🎯 System should now work without database errors';
END $$;