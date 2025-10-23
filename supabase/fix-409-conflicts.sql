-- FIX 409 CONFLICTS - Remove ALL unique constraints causing conflicts
-- Run this in Supabase SQL Editor to fix Excel upload conflicts

-- Remove ALL possible unique constraints on deliveries table
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_dr_number_key;
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_dr_number_unique;
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_pkey_dr_number;
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS unique_dr_number;
ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_dr_number_user_id_key;

-- Remove ALL possible unique constraints on delivery_history table
ALTER TABLE public.delivery_history DROP CONSTRAINT IF EXISTS delivery_history_dr_number_key;
ALTER TABLE public.delivery_history DROP CONSTRAINT IF EXISTS delivery_history_dr_number_unique;
ALTER TABLE public.delivery_history DROP CONSTRAINT IF EXISTS delivery_history_pkey_dr_number;
ALTER TABLE public.delivery_history DROP CONSTRAINT IF EXISTS unique_dr_number_history;
ALTER TABLE public.delivery_history DROP CONSTRAINT IF EXISTS delivery_history_dr_number_user_id_key;

-- Check for any remaining constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid IN (
    SELECT oid FROM pg_class WHERE relname IN ('deliveries', 'delivery_history')
) AND contype = 'u';

-- Success message
SELECT '🚨 ALL UNIQUE CONSTRAINTS REMOVED - Excel uploads should work without 409 conflicts!' as status;