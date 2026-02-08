# Neon PostgreSQL Setup Guide

## Overview
This guide will help you migrate from MySQL to Neon PostgreSQL. All code changes have been made - you just need to set up a Neon database and configure the connection.

## Option 1: Automatic Setup (Recommended)

If you have a Neon API key, I can create the project automatically for you.

### Steps:
1. Get your Neon API key from: https://console.neon.tech/app/settings/api-keys
2. Configure the Neon MCP server with your API key
3. I'll create the project and configure everything automatically

## Option 2: Manual Setup

### Step 1: Create a Neon Project

1. Go to https://console.neon.tech
2. Sign up or log in
3. Click "Create Project" or "New Project"
4. Name it: `heimdall-inventory`
5. Select a region (closest to your users)
6. Click "Create Project"

### Step 2: Get Your Connection String

After project creation, you'll see the connection string. It looks like:

```
postgres://username:password@ep-xxxxx.region.neon.tech/neondb?sslmode=require
```

Copy this connection string.

### Step 3: Update Your .env File

Open your `.env` file and add the DATABASE_URL:

```bash
# Database Configuration
DATABASE_URL=postgres://username:password@ep-xxxxx.region.neon.tech/neondb?sslmode=require

# BestBuy API Configuration
BESTBUY_API_KEY=vDloch7HfMAIbPtlLB2FE6Sp

# Server Configuration
PORT=8080
NODE_ENV=production
```

**Important:**
- Replace the `DATABASE_URL` with your actual Neon connection string
- Set `NODE_ENV=production` to use the Neon database
- For local development with PostgreSQL, use `NODE_ENV=development`

### Step 4: Test the Connection

Run the test script to verify everything works:

```bash
npm start
```

You should see:
```
Executing (default): CREATE TABLE IF NOT EXISTS "Orders" ...
Executing (default): CREATE TABLE IF NOT EXISTS "Products" ...
Executing (default): CREATE TABLE IF NOT EXISTS "OrderDetails" ...
App listening on PORT 8080
```

### Step 5: Verify Tables Created

1. Go to your Neon console: https://console.neon.tech
2. Click on your `heimdall-inventory` project
3. Go to "Tables" or "SQL Editor"
4. You should see three tables:
   - `Orders`
   - `Products`
   - `OrderDetails`

## What's Been Changed

### 1. Configuration (`/config/config.json`)
- ✅ Changed dialect from `mysql` to `postgres`
- ✅ Updated production to use `DATABASE_URL` env variable
- ✅ Added SSL configuration for Neon
- ✅ Changed default port to 5432

### 2. Dependencies (`/package.json`)
- ✅ Removed: `mysql2`
- ✅ Added: `pg@8.11.3` (PostgreSQL driver)

### 3. Models
- ✅ Updated `product.js` - Added `DECIMAL(10, 2)` precision
- ✅ Updated `orderdetail.js` - Added `DECIMAL(10, 2)` precision

### 4. Environment Variables
- ✅ `.env.example` updated with `DATABASE_URL`

## Local Development with PostgreSQL (Optional)

If you want to develop locally with PostgreSQL:

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

### Create Local Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE heimdall_dev;

# Exit
\q
```

### Run Locally

```bash
# Make sure NODE_ENV is set to development
export NODE_ENV=development

# Start the app
npm start
```

The app will use the settings from `config.json` development section:
- Username: `postgres`
- Password: `password`
- Database: `heimdall_dev`
- Host: `127.0.0.1`
- Port: `5432`

## Migration from MySQL to PostgreSQL

### Data Migration (if needed)

**Note:** According to the plan, no production data migration is needed (fresh start). However, if you want to migrate existing data:

#### Option A: Manual Migration (Small Dataset)

1. Export data from MySQL:
```bash
# Export as CSV
mysql -u root -p inventory_db -e "SELECT * FROM Products" > products.csv
mysql -u root -p inventory_db -e "SELECT * FROM Orders" > orders.csv
mysql -u root -p inventory_db -e "SELECT * FROM OrderDetails" > orderdetails.csv
```

2. Import to PostgreSQL (Neon):
```bash
# Use Neon SQL Editor or psql
\copy Products FROM 'products.csv' WITH CSV HEADER;
\copy Orders FROM 'orders.csv' WITH CSV HEADER;
\copy OrderDetails FROM 'orderdetails.csv' WITH CSV HEADER;
```

#### Option B: Use Migration Tool (Large Dataset)

Use `pgloader` to migrate automatically:

```bash
# Install pgloader
brew install pgloader  # macOS

# Run migration
pgloader mysql://root:password@localhost/inventory_db \
          postgres://username:password@ep-xxxxx.region.neon.tech/neondb
```

## Testing Checklist

After setup, verify these endpoints work:

- [ ] `GET http://localhost:8080/api/product` - Returns products
- [ ] `POST http://localhost:8080/api/product` - Creates product
- [ ] `PUT http://localhost:8080/api/product` - Updates product
- [ ] `GET http://localhost:8080/api/product/:sku` - Gets single product
- [ ] `POST http://localhost:8080/api/order` - Creates order
- [ ] Frontend pages load correctly:
  - [ ] http://localhost:8080/ - Landing page
  - [ ] http://localhost:8080/inventory - Inventory list
  - [ ] http://localhost:8080/add/inventory - Add product
  - [ ] http://localhost:8080/newOrder - Create order

## Troubleshooting

### Error: "connect ECONNREFUSED"
- Check your `DATABASE_URL` is correct
- Verify `NODE_ENV` is set to `production`
- Make sure Neon project is active (not paused)

### Error: "password authentication failed"
- Check your connection string has the correct password
- Regenerate password in Neon console if needed

### Error: "relation does not exist"
- Tables haven't been created yet
- Restart the server to trigger `sequelize.sync()`
- Check Neon console for tables

### SSL/TLS Issues
- Make sure your connection string includes `?sslmode=require`
- Verify `dialectOptions.ssl` is in `config.json` production section

### Connection Timeout
- Check your internet connection
- Verify Neon project region is accessible
- Try a different region if needed

## Key Differences: MySQL vs PostgreSQL

### Data Types
| MySQL | PostgreSQL |
|-------|------------|
| `DECIMAL` | `DECIMAL(10,2)` - explicit precision required |
| `AUTO_INCREMENT` | `SERIAL` or `autoIncrement: true` |
| Case-insensitive | Case-sensitive by default |

### Operators (Sequelize v4)
- PostgreSQL is stricter with operators
- Use parameterized queries (already implemented)

### Performance
- PostgreSQL generally performs better with complex queries
- Better support for JSON operations
- Advanced indexing capabilities

## Next Steps

Once your Neon database is set up and working:

1. ✅ Verify all tests pass: `./test-phase1.sh`
2. ✅ Test all CRUD operations
3. ✅ Verify frontend works with new database
4. ✅ Get approval for Phase 2 completion
5. ➡️ Proceed to **Phase 3: Dependency Updates (Sequelize v6)**

## Support

If you need help:
1. Check Neon documentation: https://neon.tech/docs/introduction
2. Check Sequelize PostgreSQL docs: https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql
3. Ask me for help with any issues!

## Summary

**What you need to do:**
1. Create a Neon project at https://console.neon.tech
2. Copy the connection string
3. Add it to your `.env` file as `DATABASE_URL`
4. Set `NODE_ENV=production`
5. Run `npm start`

**That's it!** The database will be automatically created and ready to use.
