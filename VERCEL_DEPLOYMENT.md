# Vercel Deployment Guide for Heimdall

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Neon PostgreSQL database set up (already done - Project ID: billowing-feather-77149027)
3. BestBuy API key

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Configure Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

**Required:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string
  ```
  postgresql://neondb_owner:npg_Z6xpJFTv7mok@ep-bitter-voice-aivo29ww-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```
- `NODE_ENV` - Set to `production`
- `BESTBUY_API_KEY` - Your BestBuy API key

**Optional:**
- `PORT` - Vercel handles this automatically, but you can set it to `8080` if needed

### 3. Deploy via Git (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect it as a Node.js project

3. **Configure Build Settings:**
   - Framework Preset: `Other`
   - Build Command: `npm run build:css` (or leave default)
   - Output Directory: Leave empty
   - Install Command: `npm install`

4. **Add Environment Variables:**
   - In the Vercel dashboard, go to Settings → Environment Variables
   - Add all the variables listed above

5. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your app

### 4. Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and set environment variables when asked
```

## Important Notes

### Database Connection

- Vercel functions are **serverless** and **stateless**
- Each request may create a new database connection
- Neon handles connection pooling automatically
- The connection string uses the `-pooler` endpoint which is optimized for serverless

### File Structure

The `vercel.json` configuration handles:
- Building the server as a serverless function
- Serving static files from `/public`
- Routing all requests through the Express app

### CSS Building

- CSS is built during deployment via the `postinstall` script
- Alternatively, commit the built `public/style/style.css` file

### Limitations

Vercel serverless functions have:
- **10-second execution timeout** (for Hobby plan)
- **50MB deployment size limit**
- **Cold starts** (first request may be slower)

### Troubleshooting

**"Please install pg package manually" error:**
- Make sure `pg` and `pg-hstore` are in `dependencies` (not `devDependencies`)
- Check that `package-lock.json` is committed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install`

**Database connection errors:**
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Make sure the connection string includes `?sslmode=require`
- Check that your Neon database is active

**CSS not loading:**
- Make sure `public/style/style.css` exists
- Check that the build command ran successfully
- Verify static file routing in `vercel.json`

**Routes not working:**
- Check the `routes` configuration in `vercel.json`
- Make sure all routes are defined before the catch-all `/(.*)`

## Testing Locally

Before deploying, test the Vercel configuration locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run locally with Vercel environment
vercel dev
```

This will simulate the Vercel environment on your local machine.

## Post-Deployment

After successful deployment:

1. **Test all functionality:**
   - Landing page loads
   - Inventory page displays
   - Can add new products
   - Can create orders
   - Inventory updates correctly

2. **Check logs:**
   - Go to Vercel dashboard → Your Project → Deployments
   - Click on the deployment → View Function Logs
   - Look for any errors or warnings

3. **Monitor performance:**
   - Check response times
   - Monitor database connections
   - Watch for cold start delays

## Updating the Deployment

To update your deployed app:

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically detect the push and redeploy.

## Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow the DNS configuration instructions
4. Vercel will automatically provision SSL certificates

## Support

- Vercel Documentation: https://vercel.com/docs
- Neon Documentation: https://neon.tech/docs
- GitHub Issues: https://github.com/tabouzeid/heimdall/issues
