# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Heimdall is a server-side rendered inventory management web application built with Express.js, PostgreSQL (via Sequelize), and Handlebars templating. The application allows users to manage product inventory, create purchase/sell orders, and track inventory levels.

**Deployed at:** https://heimdall-36558.herokuapp.com/

**Status:** 🎨 Phase 4 Complete - Ready for Phase 5

## Development Commands

```bash
# Start the development server (with auto-restart)
npm run watch

# Start the production server
npm start

# Run linting
npm test  # or npm run lint

# Auto-fix linting issues
npm run fix

# Build Tailwind CSS
npm run build:css

# Watch Tailwind CSS for changes
npm run watch:css

# Build CSS and start dev server
npm run dev
```

**Default port:** 8080 (configurable via PORT environment variable)

## Architecture

### Stack
- **Backend:** Node.js with Express.js
- **Database:** PostgreSQL (Neon) with Sequelize ORM v6.37.5
- **Templating:** Express Handlebars v7 (server-side rendering)
- **Frontend:** jQuery + Tailwind CSS v4
- **Security:** Environment-based configuration, input validation, XSS protection

### Application Flow
1. Server renders HTML views using Handlebars templates (in `/views`)
2. Client-side JavaScript (in `/public/js`) makes AJAX calls to `/api/*` endpoints
3. Server responds with JSON data
4. Client updates DOM dynamically using jQuery

This is **not a Single Page Application** - it uses traditional server-side rendering with progressive enhancement via jQuery.

## Database Models

The application has three main Sequelize models in `/models`:

### Product (Primary Key: `sku`)
- SKU is a STRING, not an auto-increment integer
- Contains pricing (purchase/sale), inventory quantity, and minimum requirement thresholds
- Referenced by OrderDetail via foreign key

### Order (Primary Key: `orderId`)
- Auto-incrementing integer ID
- Contains only the order date
- Related to multiple OrderDetails

### OrderDetail (Junction Table)
- Links Orders to Products
- Contains transaction details: `buyOrSell`, `clientName`, `quantity`, `pricePerUnit`
- Composite foreign keys: `orderId` → Order, `sku` → Product

### Model Loading
`/models/index.js` automatically loads all model files in the `/models` directory using `sequelize.import()`. The models are associated in the same file via the `associate` method if defined.

## Configuration

### Database Configuration (`/config/config.json`)
- **Development/Test:** Uses local PostgreSQL with database `heimdall_dev` / `heimdall_test`, username `postgres`, password `password`, port `5432`
- **Production:** Uses `DATABASE_URL` environment variable (Neon PostgreSQL)
  - Requires SSL connection (`sslmode=require`)
  - Project: `billowing-feather-77149027`

Environment is determined by `NODE_ENV` (defaults to 'development')

### Security Configuration
- **API Keys:** Stored in `.env` file (never committed)
- **BestBuy API:** Proxied through server-side endpoint (`/api/bestbuy/search/:category`)
- **Input Validation:** All API endpoints use validation middleware
- **XSS Protection:** Safe DOM manipulation using jQuery methods

## Routes

### API Routes (`/routes/api-routes.js`)
All API endpoints return/accept JSON with proper HTTP status codes:

- `GET /api/product` - Retrieve all products (200)
- `POST /api/product` - Create new product (201 on success, 400 on validation error, 409 on duplicate SKU)
- `PUT /api/product` - Update existing product (200 on success, 404 if not found, 400 on validation error)
- `GET /api/product/:sku` - Get single product by SKU (200 on success, 404 if not found)
- `POST /api/order` - Create order with order details (201 on success, 400 on validation error)
- `GET /api/bestbuy/search/:category` - Server-side proxy for BestBuy API (protects API key)

**Important Features:**
- All endpoints use async/await with try/catch error handling
- Input validation middleware (`/middleware/validation.js`) validates all POST/PUT requests
- Proper HTTP status codes for all responses
- JSON error messages with details for debugging
- The POST `/api/order` endpoint accepts an array of order items and automatically:
  1. Creates an Order record with the current timestamp using `new Date()`
  2. Adds the generated `orderId` to each item
  3. Bulk inserts OrderDetail records

### HTML Routes (`/routes/html-routes.js`)
- `/` - Landing page
- `/inventory` - Main inventory display
- `/newOrder` - Order creation form
- `/add/inventory` - Add new product form
- `/add/skuLookup` - SKU lookup utility
- `/update/inventory/:sku` - Product edit form

## Client-Side JavaScript Structure

Each page has a corresponding JavaScript file in `/public/js`:
- `newInventory.js` - Handles product creation form submission
- `newOrder.js` - Manages order creation UI and submission
- `updateProd.js` - Handles product update form
- `skuLookup.js` - SKU search functionality

These files make AJAX calls to the API routes and manipulate the DOM using jQuery.

## Key Development Notes

### Sequelize Version
This project uses **Sequelize v6.37.5**, which is the latest stable version. Key features:
- Uses standard `require()` for models (not `sequelize.import()`)
- Modern promise handling with async/await
- Better TypeScript support
- Improved performance and error messages

### Database Sync
`server.js` calls `db.sequelize.sync()` on startup, which synchronizes models with the database. This creates tables if they don't exist but **does not drop existing tables** (not using `force: true`).

### No Test Framework
This project has no formal unit tests. `npm test` only runs ESLint. Testing is done manually.

### Environment Variables
Production deployment relies on:
- `PORT` - Server port (defaults to 8080)
- `DATABASE_URL` - PostgreSQL/Neon connection string (production only)
- `BESTBUY_API_KEY` - BestBuy API key for SKU lookup (required)
- `NODE_ENV` - Environment selector for config.json

**Security Note:** All sensitive values are stored in `.env` file which is in `.gitignore`

## Code Style

The project uses ESLint with Airbnb base configuration. Follow these conventions:
- No semicolons are enforced inconsistently (check existing files)
- Use arrow functions for callbacks
- Destructuring is minimal in this codebase
- Console.log statements are present throughout (will be cleaned up in Phase 3+)
- All linting errors have been fixed (run `npm run lint` to verify)

## Modernization Project Status

### ✅ Phase 1: Critical Security Fixes (COMPLETE)
- **Removed hardcoded BestBuy API key** - Now uses environment variable with server-side proxy
- **Fixed XSS vulnerabilities** - All user input properly escaped using safe jQuery DOM methods
- **Added input validation** - Comprehensive validation middleware for all API endpoints
- **Improved error handling** - Proper HTTP status codes and JSON error responses
- **Documentation:** See `PHASE1_SUMMARY.md` and `SECURITY_IMPROVEMENTS.md`

### ✅ Phase 2: Database Migration to Neon PostgreSQL (COMPLETE)
- **Database driver updated** - Removed `mysql2`, added `pg@8.11.3`
- **Configuration updated** - All environments now use PostgreSQL
- **Models updated** - Added explicit `DECIMAL(10, 2)` precision for PostgreSQL compatibility
- **Neon project created** - Project ID: `billowing-feather-77149027`
- **Database setup complete** - All tables created and connection verified
- **Models/index.js fixed** - SSL dialectOptions now properly applied
- **Documentation:** See `PHASE2_SUMMARY.md` and `NEON_SETUP_GUIDE.md`

### ✅ Phase 3: Dependency Updates (COMPLETE)
- **Sequelize v4 → v6** - Migrated from `sequelize.import()` to `require()` pattern
- **Express Handlebars v5 → v7** - Updated to named export pattern
- **Moment.js removed** - Not used, deprecated package eliminated
- **ESLint updated** - v7 → v8 with latest Airbnb config
- **All dependencies modernized** - Latest stable versions installed
- **Documentation:** See `PHASE3_SUMMARY.md`

### ✅ Phase 4: Tailwind CSS Integration (COMPLETE)
- **Bootstrap removed** - Eliminated Bootstrap 4.5.2 and Bootswatch theme
- **Tailwind CSS v4 installed** - Modern utility-first CSS framework
- **All views redesigned** - Modern, responsive UI with Tailwind utilities
- **Custom branding** - Heimdall navy and blue color scheme
- **jQuery maintained** - All existing jQuery functionality preserved
- **Build scripts added** - CSS build and watch commands
- **Documentation:** See `PHASE4_SUMMARY.md`

### 📋 Phase 5: Testing Infrastructure (PLANNED)
- Add Jest for unit tests
- Add Supertest for API testing
- Set up test coverage reporting

## Testing Scripts

- `./test-phase1.sh` - Verify security fixes (all tests passing ✅)
- `./test-phase2.sh` - Verify database migration (all tests passing ✅)

## Key Files for Modernization

### Phase 1, 2 & 3 Changes
### Phase 1, 2, 3 & 4 Changes
- `/middleware/validation.js` - NEW: Input validation logic
- `/routes/api-routes.js` - Updated with validation, error handling, BestBuy proxy
- `/config/config.json` - Changed to PostgreSQL
- `/models/index.js` - Migrated to Sequelize v6 pattern (require instead of import)
- `/models/product.js` - Added DECIMAL(10,2) precision
- `/models/orderdetail.js` - Added DECIMAL(10,2) precision
- `/server.js` - Updated express-handlebars to v7 named export
- `/package.json` - All dependencies updated, Tailwind CSS added
- `/public/style/input.css` - NEW: Tailwind source file with custom theme
- `/public/style/style.css` - Generated Tailwind CSS output
- `/views/layouts/main.handlebars` - Removed Bootstrap, added Tailwind
- `/views/landing.handlebars` - Complete redesign with Tailwind
- `/views/inventory.handlebars` - Modern table and navigation
- `/views/newInventory.handlebars` - Modern form design
- `/views/newOrder.handlebars` - Responsive table design
- `/views/skuLookup.handlebars` - Modern search interface
- `/views/updateProd.handlebars` - Consistent form styling
- `/public/js/skuLookup.js` - Fixed XSS, uses proxy endpoint
- `/public/js/newInventory.js` - Fixed XSS vulnerabilities
- `/public/js/newOrder.js` - Fixed XSS vulnerabilities
- `.env` - Contains sensitive configuration (not committed)
- `.env.example` - Template for environment variables

### Documentation Files
- `PHASE1_SUMMARY.md` - Security fixes summary
- `PHASE2_SUMMARY.md` - Database migration summary
- `PHASE3_SUMMARY.md` - Dependency updates summary
- `PHASE4_SUMMARY.md` - Tailwind CSS integration summary
- `SECURITY_IMPROVEMENTS.md` - Detailed before/after security comparison
- `NEON_SETUP_GUIDE.md` - Step-by-step Neon setup instructions
