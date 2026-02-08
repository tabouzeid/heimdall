#!/bin/bash

echo "=========================================="
echo "Phase 1 Security Verification Tests"
echo "=========================================="
echo ""

# Start server in background
echo "Starting server..."
npm start > /dev/null 2>&1 &
SERVER_PID=$!
sleep 3

echo "✅ Server started (PID: $SERVER_PID)"
echo ""

# Test 1: API endpoint returns products
echo "Test 1: GET /api/product"
RESPONSE=$(curl -s http://localhost:8080/api/product)
if [ -n "$RESPONSE" ]; then
  echo "✅ PASS - API returns product data"
else
  echo "❌ FAIL - No response from API"
fi
echo ""

# Test 2: Validation - Empty SKU should return 400
echo "Test 2: Validation - Empty SKU (should return 400)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/api/product \
  -H "Content-Type: application/json" \
  -d '{"sku":"","name":"Test","description":"Test","currentPurchasePrice":10,"currentSalePrice":15,"inventoryQuantity":100}')
if [ "$HTTP_CODE" = "400" ]; then
  echo "✅ PASS - Returns 400 for invalid input"
else
  echo "❌ FAIL - Expected 400, got $HTTP_CODE"
fi
echo ""

# Test 3: Duplicate SKU detection
echo "Test 3: Duplicate SKU detection (should return 409)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/api/product \
  -H "Content-Type: application/json" \
  -d '{"sku":"12345","name":"Duplicate","description":"Test","currentPurchasePrice":10,"currentSalePrice":15,"inventoryQuantity":100}')
if [ "$HTTP_CODE" = "409" ]; then
  echo "✅ PASS - Duplicate SKU rejected with 409"
else
  echo "❌ FAIL - Expected 409, got $HTTP_CODE"
fi
echo ""

# Test 4: Not found - Returns 404
echo "Test 4: Non-existent product (should return 404)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/product/NONEXISTENT_SKU_12345)
if [ "$HTTP_CODE" = "404" ]; then
  echo "✅ PASS - Returns 404 for non-existent product"
else
  echo "❌ FAIL - Expected 404, got $HTTP_CODE"
fi
echo ""

# Test 5: BestBuy proxy works
echo "Test 5: BestBuy API proxy endpoint"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/bestbuy/search/pcmcat241600050001")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS - BestBuy proxy endpoint working"
else
  echo "❌ FAIL - BestBuy proxy returned $HTTP_CODE"
fi
echo ""

# Test 6: API key not exposed in client code
echo "Test 6: API key not exposed in client-side JavaScript"
if grep -q "vDloch7HfMAIbPtlLB2FE6Sp" public/js/skuLookup.js; then
  echo "❌ FAIL - API key still found in skuLookup.js"
else
  echo "✅ PASS - API key removed from client-side code"
fi
echo ""

# Test 7: XSS protection - Template literals removed
echo "Test 7: XSS protection - Template literals replaced with safe DOM methods"
if grep -q 'append(\`<' public/js/skuLookup.js public/js/newInventory.js; then
  echo "❌ FAIL - Template literals still found in client code"
else
  echo "✅ PASS - Template literals removed, using safe jQuery methods"
fi
echo ""

# Cleanup
echo "Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo ""
echo "=========================================="
echo "Phase 1 Verification Complete!"
echo "=========================================="
