-- CLEAR ALL DATA FROM SUPABASE
-- This will delete all records from all tables to start fresh

-- WARNING: This will permanently delete ALL your data!
-- Make sure you want to do this before running

-- Clear all deliveries data
DELETE FROM public.deliveries;

-- Clear all delivery history data
DELETE FROM public.delivery_history;

-- Clear all customers data
DELETE FROM public.customers;

-- Clear all user profiles data (except your own if you want to keep login)
-- DELETE FROM public.user_profiles;

-- Reset any sequences (if they exist)
-- This ensures IDs start from 1 again
SELECT setval(pg_get_serial_sequence('public.deliveries', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.delivery_history', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.customers', 'id'), 1, false);

-- Verify all tables are empty
SELECT 'deliveries' as table_name, COUNT(*) as record_count FROM public.deliveries
UNION ALL
SELECT 'delivery_history' as table_name, COUNT(*) as record_count FROM public.delivery_history
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as record_count FROM public.customers
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM public.user_profiles;

-- Success message
SELECT '🚨 ALL DATA CLEARED SUCCESSFULLY! 🚨' as status;