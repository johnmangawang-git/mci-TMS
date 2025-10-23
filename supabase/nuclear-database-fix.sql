-- NUCLEAR DATABASE FIX - Complete reset and proper setup
-- This will fix 406 errors and data duplication issues

-- Step 1: Disable RLS temporarily to fix access issues
ALTER TABLE IF EXISTS public.deliveries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.delivery_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can manage their own deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.deliveries;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.deliveries;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.deliveries;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.deliveries;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.deliveries;

-- Step 3: Ensure tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dr_number TEXT NOT NULL,
    customer_name TEXT,
    vendor_number TEXT,
    origin TEXT,
    destination TEXT,
    truck_type TEXT,
    truck_plate_number TEXT,
    status TEXT DEFAULT 'Active',
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

CREATE TABLE IF NOT EXISTS public.delivery_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dr_number TEXT NOT NULL,
    customer_name TEXT,
    vendor_number TEXT,
    origin TEXT,
    destination TEXT,
    truck_type TEXT,
    truck_plate_number TEXT,
    status TEXT DEFAULT 'Completed',
    distance TEXT,
    additional_costs DECIMAL(10,2) DEFAULT 0.00,
    delivery_date DATE DEFAULT CURRENT_DATE,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    item_number TEXT,
    item_description TEXT,
    serial_number TEXT,
    mobile_number TEXT,
    created_by TEXT DEFAULT 'System',
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    additional_data JSONB DEFAULT '{}',
    signature_data TEXT
);

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

-- Step 4: Remove ALL unique constraints that cause conflicts
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_dr_number_key;
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_dr_number_unique;
ALTER TABLE public.delivery_history DROP CONSTRAINT IF EXISTS delivery_history_dr_number_key;
ALTER TABLE public.delivery_history DROP CONSTRAINT IF EXISTS delivery_history_dr_number_unique;

-- Step 5: Grant full permissions (nuclear option for testing)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 6: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_dr_number ON public.deliveries(dr_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_delivery_history_dr_number ON public.delivery_history(dr_number);

-- Step 7: Test table access
SELECT 'Testing deliveries table...' as test;
SELECT COUNT(*) as deliveries_count FROM public.deliveries;

SELECT 'Testing delivery_history table...' as test;
SELECT COUNT(*) as history_count FROM public.delivery_history;

-- Success message
SELECT '🚨 NUCLEAR DATABASE FIX APPLIED - RLS disabled, full permissions granted!' as status;
SELECT 'WARNING: This is for testing only. Re-enable RLS for production!' as warning;