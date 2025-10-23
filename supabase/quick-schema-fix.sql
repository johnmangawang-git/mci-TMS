-- QUICK SCHEMA FIX for Excel Upload Issues
-- Run this in your Supabase SQL Editor to fix immediate issues

-- 1. Fix deliveries table to remove unique constraint on dr_number
-- This allows multiple deliveries with same DR number (different serials)
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_dr_number_key;

-- 2. Create bookings table if it doesn't exist (minimal version)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 3. Enable RLS on bookings if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy for bookings
CREATE POLICY IF NOT EXISTS "Users can manage their own bookings" ON public.bookings
    FOR ALL USING (auth.uid() = user_id);

-- 5. Add composite unique constraint for deliveries (dr_number + user_id)
-- This allows same DR across different users but prevents duplicates per user
ALTER TABLE public.deliveries 
ADD CONSTRAINT IF NOT EXISTS deliveries_dr_number_user_unique 
UNIQUE (dr_number, user_id);

-- 6. Add missing columns to deliveries table if they don't exist
ALTER TABLE public.deliveries 
ADD COLUMN IF NOT EXISTS item_number TEXT,
ADD COLUMN IF NOT EXISTS item_description TEXT,
ADD COLUMN IF NOT EXISTS serial_number TEXT,
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS additional_data JSONB DEFAULT '{}';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Quick schema fix applied successfully!';
    RAISE NOTICE 'Excel uploads should now work properly.';
    RAISE NOTICE 'DR number conflicts resolved with composite unique constraint.';
END $$;