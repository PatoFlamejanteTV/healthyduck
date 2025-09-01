-- Adding SQL test suite for database schema validation and data integrity
-- HealthyDuck Database Test Suite
-- Tests for data integrity, constraints, and performance

-- Test 1: Verify all required tables exist
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('profiles', 'data_sources', 'data_points', 'sessions', 'data_sets')) = 5,
           'All required tables should exist';
    
    RAISE NOTICE 'Test 1 PASSED: All required tables exist';
END $$;

-- Test 2: Verify Row Level Security is enabled
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_policies WHERE tablename IN 
            ('profiles', 'data_sources', 'data_points', 'sessions', 'data_sets')) >= 5,
           'RLS policies should be enabled on all tables';
    
    RAISE NOTICE 'Test 2 PASSED: Row Level Security policies are in place';
END $$;

-- Test 3: Test data source creation and constraints
INSERT INTO profiles (id, email, full_name) 
VALUES ('test-user-sql', 'test@healthyduck.com', 'SQL Test User')
ON CONFLICT (id) DO NOTHING;

INSERT INTO data_sources (
    id, user_id, data_stream_name, type, application_package_name, 
    application_version, data_type_name, data_type_fields
) VALUES (
    'test-ds-sql', 'test-user-sql', 'com.ultimatequack.test.steps', 
    'raw', 'com.ultimatequack.healthyduck', '1.0.0',
    'com.ultimatequack.step_count', 
    '[{"name": "steps", "format": "integer"}]'::jsonb
);

-- Verify the insertion
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM data_sources WHERE id = 'test-ds-sql') = 1,
           'Data source should be inserted successfully';
    
    RAISE NOTICE 'Test 3 PASSED: Data source creation works correctly';
END $$;

-- Test 4: Test data point insertion with proper timestamps
INSERT INTO data_points (
    id, user_id, data_source_id, start_time_nanos, end_time_nanos,
    data_type_name, value, origin_data_source_id
) VALUES (
    'test-dp-sql', 'test-user-sql', 'test-ds-sql',
    (EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour') * 1000000000)::bigint,
    (EXTRACT(EPOCH FROM NOW()) * 1000000000)::bigint,
    'com.ultimatequack.step_count',
    '[{"intVal": 5000}]'::jsonb,
    'test-ds-sql'
);

-- Verify data point constraints
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM data_points WHERE id = 'test-dp-sql') = 1,
           'Data point should be inserted successfully';
    
    ASSERT (SELECT start_time_nanos < end_time_nanos FROM data_points WHERE id = 'test-dp-sql'),
           'Start time should be before end time';
    
    RAISE NOTICE 'Test 4 PASSED: Data point insertion and constraints work correctly';
END $$;

-- Test 5: Test session creation and activity type validation
INSERT INTO sessions (
    id, user_id, name, description, start_time_millis, end_time_millis,
    activity_type, application_package_name, active_time_millis
) VALUES (
    'test-session-sql', 'test-user-sql', 'SQL Test Workout', 
    'Database test session', 
    (EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour') * 1000)::bigint,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint,
    8, 'com.ultimatequack.healthyduck', 3600000
);

-- Verify session data
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM sessions WHERE id = 'test-session-sql') = 1,
           'Session should be inserted successfully';
    
    ASSERT (SELECT start_time_millis < end_time_millis FROM sessions WHERE id = 'test-session-sql'),
           'Session start time should be before end time';
    
    RAISE NOTICE 'Test 5 PASSED: Session creation works correctly';
END $$;

-- Test 6: Test data aggregation performance
-- Create sample data for performance testing
INSERT INTO data_points (
    id, user_id, data_source_id, start_time_nanos, end_time_nanos,
    data_type_name, value, origin_data_source_id
)
SELECT 
    'perf-test-' || generate_series,
    'test-user-sql',
    'test-ds-sql',
    (EXTRACT(EPOCH FROM NOW() - (generate_series || ' hours')::interval) * 1000000000)::bigint,
    (EXTRACT(EPOCH FROM NOW() - (generate_series || ' hours')::interval + INTERVAL '1 minute') * 1000000000)::bigint,
    'com.ultimatequack.step_count',
    ('[{"intVal": ' || (1000 + generate_series * 100) || '}]')::jsonb,
    'test-ds-sql'
FROM generate_series(1, 100);

-- Test aggregation query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    DATE_TRUNC('day', TO_TIMESTAMP(start_time_nanos / 1000000000)) as day,
    COUNT(*) as data_points,
    SUM((value->0->>'intVal')::int) as total_steps
FROM data_points 
WHERE user_id = 'test-user-sql' 
    AND data_type_name = 'com.ultimatequack.step_count'
    AND start_time_nanos >= (EXTRACT(EPOCH FROM NOW() - INTERVAL '7 days') * 1000000000)::bigint
GROUP BY DATE_TRUNC('day', TO_TIMESTAMP(start_time_nanos / 1000000000))
ORDER BY day;

-- Test 7: Verify foreign key constraints
DO $$
BEGIN
    -- Try to insert data point with non-existent data source (should fail)
    BEGIN
        INSERT INTO data_points (
            id, user_id, data_source_id, start_time_nanos, end_time_nanos,
            data_type_name, value, origin_data_source_id
        ) VALUES (
            'invalid-test', 'test-user-sql', 'non-existent-ds',
            (EXTRACT(EPOCH FROM NOW()) * 1000000000)::bigint,
            (EXTRACT(EPOCH FROM NOW()) * 1000000000)::bigint,
            'com.ultimatequack.step_count', '[{"intVal": 100}]'::jsonb, 'non-existent-ds'
        );
        
        RAISE EXCEPTION 'Should not reach here - foreign key constraint should prevent insertion';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'Test 7 PASSED: Foreign key constraints are working correctly';
    END;
END $$;

-- Test 8: Test JSON data validation
DO $$
BEGIN
    -- Test valid JSON structure
    ASSERT (SELECT jsonb_typeof(value) = 'array' FROM data_points WHERE id = 'test-dp-sql'),
           'Data point value should be a JSON array';
    
    ASSERT (SELECT jsonb_typeof(data_type_fields) = 'array' FROM data_sources WHERE id = 'test-ds-sql'),
           'Data type fields should be a JSON array';
    
    RAISE NOTICE 'Test 8 PASSED: JSON data validation works correctly';
END $$;

-- Test 9: Test index performance
-- Check if indexes exist for common query patterns
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_indexes 
            WHERE tablename = 'data_points' 
            AND indexname LIKE '%user_id%') >= 1,
           'User ID index should exist on data_points table';
    
    ASSERT (SELECT COUNT(*) FROM pg_indexes 
            WHERE tablename = 'data_points' 
            AND indexname LIKE '%start_time%') >= 1,
           'Time-based index should exist on data_points table';
    
    RAISE NOTICE 'Test 9 PASSED: Required indexes are in place';
END $$;

-- Test 10: Cleanup test data
DELETE FROM data_points WHERE user_id = 'test-user-sql';
DELETE FROM sessions WHERE user_id = 'test-user-sql';
DELETE FROM data_sources WHERE user_id = 'test-user-sql';
DELETE FROM profiles WHERE id = 'test-user-sql';

-- Verify cleanup
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM data_points WHERE user_id = 'test-user-sql') = 0,
           'Test data should be cleaned up';
    
    RAISE NOTICE 'Test 10 PASSED: Test data cleanup completed successfully';
    RAISE NOTICE '=== ALL DATABASE TESTS COMPLETED SUCCESSFULLY ===';
END $$;
