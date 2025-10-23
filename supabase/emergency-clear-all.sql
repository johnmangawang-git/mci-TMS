-- EMERGENCY CLEAR ALL - Complete database reset
-- WARNING: This will delete ALL your data permanently!

-- Clear all data from all tables
TRUNCATE TABLE public.deliveries CASCADE;
TRUNCATE TABLE public.delivery_history CASCADE;
TRUNCATE TABLE public.customers CASCADE;

-- Reset sequences if they exist
SELECT setval(pg_get_serial_sequence('public.deliveries', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.delivery_history', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.customers', 'id'), 1, false);

-- Verify all tables are empty
SELECT 'deliveries' as table_name, COUNT(*) as record_count FROM public.deliveries
UNION ALL
SELECT 'delivery_history' as table_name, COUNT(*) as record_count FROM public.delivery_history
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as record_count FROM public.customers;

-- Success message
SELECT '🚨 EMERGENCY CLEAR COMPLETED - ALL DATA DELETED!' as status;