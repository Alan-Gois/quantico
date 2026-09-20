#!/bin/bash

FRONTEND_URL="${1:-https://quantico-frontend.vercel.app}"
BACKEND_URL="${2:-https://quantico-backend.railway.app}"

echo "Starting smoke tests..."
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_code=$5

    echo -n "Testing $name... "

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL$endpoint")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "$expected_code" ]; then
        echo "PASS (HTTP $http_code)"
        ((TESTS_PASSED++))
    else
        echo "FAIL (HTTP $http_code, expected $expected_code)"
        echo "Response: $body"
        ((TESTS_FAILED++))
    fi
}

echo "=== Frontend Tests ==="
test_endpoint "Frontend Home" "GET" "/" "" "200"

echo ""
echo "=== Backend Tests ==="
test_endpoint "Health Check" "GET" "/health" "" "200"

test_endpoint "BB84 Step-by-Step" "POST" "/simulate/bb84/stepbystep" \
    '{"distance_km": 10, "fiber_loss_db_km": 0.22, "detector_efficiency": 0.8, "dark_count_rate": 0.00001}' \
    "200"

test_endpoint "MDI-QKD Step-by-Step" "POST" "/simulate/mdi-qkd/stepbystep" \
    '{"distance_km": 20, "fiber_loss_db_km": 0.22, "detection_efficiency": 0.8, "quantum_bit_error_rate": 0.1}' \
    "200"

test_endpoint "BB84 Sweep Step-by-Step" "POST" "/sweep/bb84/stepbystep" \
    '{"min_km": 0, "max_km": 30, "num_points": 5}' \
    "200"

test_endpoint "MDI-QKD Sweep Step-by-Step" "POST" "/sweep/mdi-qkd/stepbystep" \
    '{"min_km": 0, "max_km": 100, "num_points": 5}' \
    "200"

echo ""
echo "=== Summary ==="
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "All tests PASSED!"
    exit 0
else
    echo "Some tests FAILED!"
    exit 1
fi
