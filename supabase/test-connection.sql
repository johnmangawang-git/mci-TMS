-- TEST CONNECTION - Simple test to verify database access
-- Run this to check if your database is accessible

-- Test 1: Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('deliveries', 'delivery_history', 'customers', 'user_profiles');

-- Test 2: Check table permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('deliveries', 'delivery_history', 'customers', 'user_profiles');

-- Test 3: Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('deliveries', 'delivery_history', 'customers', 'user_profiles');

-- Test 4: Simple count queries
SELECT 'deliveries' as table_name, COUNT(*) as row_count FROM public.deliveries
UNION ALL
SELECT 'delivery_history' as table_name, COUNT(*) as row_count FROM public.delivery_history
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as row_count FROM public.customers
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM public.user_profiles;

-- Success message
SELECT 'DATABASE CONNECTION TEST COMPLETED' as status;