# Live Scoring Setup Guide

## Quick Start for Awards Night

### 1. Test the System
```bash
# Test with mock data
node scripts/live-scraping-instant.mjs live-scrape golden-globes-2026

# Test web scraping (may need VPN/proxy for geo-blocking)
node scripts/live-scraping-instant.mjs test-scrape golden-globes-2026
```

### 2. Start Live Scoring
```bash
# Start 15-minute updates for Golden Globes
node scripts/live-scraping-instant.mjs live-scrape golden-globes-2026

# For Oscars
node scripts/live-scraping-instant.mjs live-scrape oscars-2026
```

### 3. Real-time UI Updates
The system automatically updates scores in your app when winners are announced.

## Features

✅ **Real Web Scraping**: Automatically scrapes GoldenGlobes.com for winners  
✅ **15-minute Updates**: Checks for new winners every 15 minutes  
✅ **Fuzzy Matching**: Intelligently matches scraped winners to your database  
✅ **Score Calculation**: Automatically updates user scores and rankings  
✅ **Duplicate Prevention**: Won't record the same winner twice  
✅ **Fallback System**: Uses mock data if scraping fails  

## Deployment Options

### Option A: Local Machine (Simplest)
Run the script locally during the ceremony:
```bash
node scripts/live-scraping-instant.mjs live-scrape golden-globes-2026
```

### Option B: Netlify Functions (Recommended)
Deploy to Netlify for reliable execution:
1. Push to GitHub
2. Enable Netlify Functions
3. Set up scheduled cron job (every 15 minutes)

### Option C: Cloud Server
Run on a VPS for maximum control:
```bash
# Install dependencies
npm install puppeteer

# Run with PM2 for process management
pm2 start "node scripts/live-scraping-instant.mjs live-scrape golden-globes-2026" --name live-scoring
```

## Monitoring

The script provides real-time logs:
- 🏆 Winner announcements
- 📊 Score updates
- ⚠️ Matching issues
- ❌ Errors

## Troubleshooting

### If scraping fails:
1. Check internet connection
2. Try VPN (geo-blocking)
3. Falls back to mock data automatically

### If no matches found:
1. Check category names in your database
2. Fuzzy matching handles most variations
3. Manual override available

## Award Night Checklist

- [ ] Test script with mock data
- [ ] Verify categories are loaded in Instant DB
- [ ] Test web scraping (if possible)
- [ ] Set up notifications (Slack/Discord)
- [ ] Start live scoring 30 min before ceremony
- [ ] Monitor logs during ceremony
- [ ] Celebrate winners! 🎉
