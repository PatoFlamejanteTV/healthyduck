#!/bin/bash

# Healthyduck API Test Script
# Usage: ./test_api.sh [BASE_URL] [ACCESS_TOKEN]

set -e  # Exit on any error

# Configuration
BASE_URL=${1:-"http://localhost:3000"}
ACCESS_TOKEN=${2:-"your-access-token-here"}
USER_ID="me"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local expected_status="$2"
    shift 2
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    
    if response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$@"); then
        http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*$//')
        
        if [ "$http_code" -eq "$expected_status" ]; then
            echo -e "${GREEN}✓ PASS${NC} - HTTP $http_code"
            ((TESTS_PASSED++))
            if [ -n "$body" ] && [ "$body" != "null" ]; then
                echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
            fi
        else
            echo -e "${RED}✗ FAIL${NC} - Expected HTTP $expected_status, got $http_code"
            echo "Response: $body"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} - Request failed"
        ((TESTS_FAILED++))
    fi
    
    echo ""
}

echo "Healthyduck API Test Suite"
echo "=========================="
echo "Base URL: $BASE_URL"
echo "User ID: $USER_ID"
echo ""

# Test 1: Get user profile
run_test "Get User Profile" 200 \
    -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/profile"

# Test 2: Get data sources (should work even if empty)
run_test "Get Data Sources" 200 \
    -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/dataSources"

# Test 3: Create a data source
DATA_SOURCE_ID="test-script:steps:$(date +%s)"
run_test "Create Data Source" 201 \
    -X POST \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"dataStreamId\": \"$DATA_SOURCE_ID\",
        \"dataStreamName\": \"Test Script Step Counter\",
        \"type\": \"raw\",
        \"dataType\": {
            \"name\": \"com.ultimatequack.step_count.delta\"
        },
        \"application\": {
            \"packageName\": \"com.example.test-script\",
            \"version\": \"1.0\"
        }
    }" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/dataSources"

# Test 4: Add data points
NOW_NS=$(date +%s)000000000
HOUR_AGO_NS=$((NOW_NS - 3600000000000))
DATASET_ID="${HOUR_AGO_NS}-${NOW_NS}"

run_test "Add Data Points" 200 \
    -X PATCH \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"point\": [{
            \"startTimeNanos\": \"$HOUR_AGO_NS\",
            \"endTimeNanos\": \"$NOW_NS\",
            \"dataTypeName\": \"com.ultimatequack.step_count.delta\",
            \"value\": [{\"intVal\": 5000}]
        }]
    }" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/dataSources/$DATA_SOURCE_ID/datasets/$DATASET_ID"

# Test 5: Create a session
SESSION_ID="test-session-$(date +%s)"
START_TIME_MS=$(($(date +%s) * 1000 - 1800000))  # 30 minutes ago
END_TIME_MS=$(($(date +%s) * 1000))

run_test "Create Session" 201 \
    -X POST \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"id\": \"$SESSION_ID\",
        \"name\": \"Test Script Workout\",
        \"description\": \"Automated test session\",
        \"startTimeMillis\": \"$START_TIME_MS\",
        \"endTimeMillis\": \"$END_TIME_MS\",
        \"activityType\": 8,
        \"activeTimeMillis\": \"1800000\"
    }" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/sessions"

# Test 6: Get sessions
WEEK_AGO_MS=$(($(date +%s) * 1000 - 604800000))
NOW_MS=$(($(date +%s) * 1000))

run_test "Get Sessions" 200 \
    -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/sessions?startTime=$WEEK_AGO_MS&endTime=$NOW_MS"

# Test 7: Test error handling (invalid endpoint)
run_test "Invalid Endpoint (404)" 404 \
    -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/invalid-endpoint"

# Test 8: Test unauthorized access
run_test "Unauthorized Access" 401 \
    -X GET \
    -H "Content-Type: application/json" \
    "$BASE_URL/api/fitness/v1/users/$USER_ID/profile"

# Performance test
echo -e "${YELLOW}Performance Test: 10 concurrent requests${NC}"
start_time=$(date +%s.%N)

for i in {1..10}; do
    curl -s -o /dev/null \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$BASE_URL/api/fitness/v1/users/$USER_ID/profile" &
done

wait  # Wait for all background jobs to complete

end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)
echo -e "${GREEN}✓ Performance test completed in ${duration}s${NC}"
echo ""

# Summary
echo "Test Results Summary"
echo "==================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! 🎉${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please check the API implementation.${NC}"
    exit 1
fi
