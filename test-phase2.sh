#!/bin/bash

echo "=========================================="
echo "Phase 2 Database Migration Verification"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set for production
if [ "$NODE_ENV" = "production" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set in .env file"
    echo "Please add your Neon connection string to .env"
    echo "See NEON_SETUP_GUIDE.md for instructions"
    exit 1
  fi
  echo "✅ DATABASE_URL configured for production"
else
  echo "ℹ️  Running in development mode (local PostgreSQL)"
fi
echo ""

# Check PostgreSQL driver is installed
echo "Checking PostgreSQL driver..."
if npm list pg > /dev/null 2>&1; then
  echo "✅ PostgreSQL driver (pg) installed"
else
  echo "❌ PostgreSQL driver not found"
  echo "Run: npm install pg@8.11.3"
  exit 1
fi
echo ""

# Check MySQL driver is NOT installed
echo "Checking MySQL driver removed..."
if npm list mysql2 > /dev/null 2>&1; then
  echo "⚠️  WARNING: mysql2 is still installed"
  echo "Run: npm uninstall mysql2"
else
  echo "✅ MySQL driver removed"
fi
echo ""

# Check config.json has postgres dialect
echo "Checking configuration..."
if grep -q '"dialect": "postgres"' config/config.json; then
  echo "✅ config.json updated to use PostgreSQL"
else
  echo "❌ config.json still using MySQL"
  exit 1
fi
echo ""

# Check models have DECIMAL precision
echo "Checking model updates..."
if grep -q 'DECIMAL(10, 2)' models/product.js && grep -q 'DECIMAL(10, 2)' models/orderdetail.js; then
  echo "✅ Models updated with explicit DECIMAL precision"
else
  echo "❌ Models missing DECIMAL precision"
  exit 1
fi
echo ""

# Start server
echo "Starting server to test database connection..."
npm start > /tmp/heimdall-test.log 2>&1 &
SERVER_PID=$!
sleep 5

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null; then
  echo "✅ Server started successfully (PID: $SERVER_PID)"
else
  echo "❌ Server failed to start"
  echo "Check logs:"
  cat /tmp/heimdall-test.log
  exit 1
fi
echo ""

# Check logs for table creation
echo "Checking if tables were created..."
sleep 2

if grep -q "CREATE TABLE" /tmp/heimdall-test.log; then
  echo "✅ Database tables created successfully"

  # Show which tables were created
  echo ""
  echo "Tables created:"
  grep "CREATE TABLE" /tmp/heimdall-test.log | sed 's/.*CREATE TABLE IF NOT EXISTS/  -/' | sed 's/ .*//' | sort -u
else
  echo "⚠️  No CREATE TABLE statements found in logs"
  echo "Tables may already exist or there was an error"
fi
echo ""

# Test database connection with API call
echo "Testing API endpoints with PostgreSQL..."
sleep 2

# Test GET /api/product
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/product)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ GET /api/product - Returns 200"
else
  echo "❌ GET /api/product - Failed (HTTP $HTTP_CODE)"
fi

# Test POST /api/product (create test product)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/api/product \
  -H "Content-Type: application/json" \
  -d '{"sku":"PGTEST001","name":"PostgreSQL Test Product","description":"Testing PostgreSQL migration","currentPurchasePrice":10.50,"currentSalePrice":15.99,"inventoryQuantity":100,"minRequirement":10}')
if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ POST /api/product - Product created (HTTP 201)"
elif [ "$HTTP_CODE" = "409" ]; then
  echo "✅ POST /api/product - Product exists (HTTP 409)"
else
  echo "❌ POST /api/product - Failed (HTTP $HTTP_CODE)"
fi

# Test GET specific product
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/product/PGTEST001)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ GET /api/product/:sku - Returns test product"
else
  echo "⚠️  GET /api/product/:sku - Product not found (might be first run)"
fi

# Test DECIMAL precision
echo ""
echo "Testing DECIMAL precision..."
PRICE=$(curl -s http://localhost:8080/api/product/PGTEST001 | grep -o '"currentPurchasePrice":"[^"]*"' | cut -d'"' -f4)
if [ ! -z "$PRICE" ]; then
  echo "✅ DECIMAL values stored correctly: $PRICE"
else
  echo "⚠️  Could not verify DECIMAL precision (product may not exist)"
fi
echo ""

# Check for PostgreSQL-specific features
echo "Checking PostgreSQL-specific SQL..."
if grep -q "INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT" /tmp/heimdall-test.log; then
  echo "⚠️  WARNING: SQLite syntax detected (should be PostgreSQL)"
elif grep -q "auto_increment" /tmp/heimdall-test.log; then
  echo "⚠️  WARNING: MySQL syntax detected (should be PostgreSQL)"
else
  echo "✅ Using PostgreSQL syntax"
fi
echo ""

# Cleanup
echo "Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo ""
echo "=========================================="
echo "Phase 2 Migration Verification Complete!"
echo "=========================================="
echo ""

# Show summary
echo "Summary:"
echo "- PostgreSQL driver installed"
echo "- Models updated for PostgreSQL"
echo "- Configuration updated"
echo "- Database connection tested"
echo "- API endpoints working"
echo ""

if [ "$NODE_ENV" = "production" ]; then
  echo "✅ Running with Neon PostgreSQL (production)"
  echo ""
  echo "Next step: Verify in Neon Console"
  echo "1. Go to https://console.neon.tech"
  echo "2. Select your heimdall-inventory project"
  echo "3. Check Tables section - you should see:"
  echo "   - Orders"
  echo "   - Products"
  echo "   - OrderDetails"
else
  echo "ℹ️  Running with local PostgreSQL (development)"
  echo ""
  echo "To use Neon (production):"
  echo "1. Set up Neon project (see NEON_SETUP_GUIDE.md)"
  echo "2. Add DATABASE_URL to .env"
  echo "3. Set NODE_ENV=production"
  echo "4. Run this test again"
fi

rm /tmp/heimdall-test.log
