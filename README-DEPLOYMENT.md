# Reel Rivals Deployment Guide

## Overview
Reel Rivals is a movie awards prediction app built with React, TypeScript, and Supabase.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS + Framer Motion
- **Deployment**: Netlify

## Environment Variables
Required environment variables are configured in `netlify.toml`:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_TMDB_API_KEY`: TMDb API key for movie posters

## Database Schema
Complete database schema with RLS policies:
- `users` - User profiles and authentication
- `leagues` - League management
- `league_members` - League membership
- `events` - Award ceremonies (Golden Globes, Oscars, etc.)
- `categories` - Award categories per event
- `nominees` - Nominees per category
- `ballots` - User picks per event/league
- `picks` - Individual category selections
- `results` - Official winners
- `scores` - Calculated scores with triggers

## Features Implemented

### ✅ Core Features
- **Authentication**: Real Supabase Auth with email/password
- **League Management**: Create/join leagues with unique codes
- **Ballot System**: Real database-connected voting with power picks
- **Data Seeding**: Golden Globes 2026 with 15 categories
- **Real-time Updates**: Supabase subscriptions for live scoring

### ✅ UI Components
- **Onboarding**: Avatar selection, signup/login flow
- **Ballot Swiper**: Category navigation, nominee selection
- **Activity Feed**: Real-time user actions
- **League Standings**: Score tracking and leaderboards
- **Profile System**: User stats and achievements

### 🚧 In Progress
- **Admin Panel**: Winner entry interface
- **Live Mode**: Real-time ceremony updates
- **Mobile Optimization**: Enhanced mobile experience

## Deployment Instructions

### Netlify (Recommended)
1. Connect repository to Netlify
2. Environment variables are pre-configured in `netlify.toml`
3. Automatic deployment on push to main branch

### Manual Deployment
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## Local Development

### Setup
```bash
# Clone repository
git clone [repository-url]
cd ReelRivals

# Install dependencies
npm install

# Start development server
npm run dev
```

# Environment Variables
Create `.env.local` file for local development:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TMDB_API_KEY=your-tmdb-api-key
```

## Database Access

### Supabase Dashboard
- **Project**: Reel Rivals
- **URL**: [Your Supabase Project URL]
- **Tables**: All tables have RLS enabled
- **Real-time**: Enabled on scores, results, picks

### Key Features
- **Row Level Security**: Users can only access their own data
- **Automatic Scoring**: Triggers calculate scores when winners are entered
- **League Codes**: Auto-generated unique codes (e.g., GLOBES-XJKR)
- **Power Picks**: 3x point multiplier for strategic picks

## Next Steps for Production

1. **Admin Panel**: Create interface for entering winners during ceremonies
2. **Push Notifications**: Supabase Edge Functions for ceremony alerts
3. **Analytics**: User engagement and retention tracking
4. **Mobile App**: React Native version for iOS/Android

## Support
- **Documentation**: See inline code comments
- **Database**: Check Supabase dashboard for data management
- **Issues**: Create GitHub issues for bugs/features
