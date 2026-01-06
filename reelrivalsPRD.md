# Reel Rivals - Product Requirements Document
## Connect with friends through awards season predictions

---

## 1. Executive Summary

**Product Name:** Reel Rivals  
**Tagline:** "Predict. Compete. Connect."  
**Mission:** Create a fun, social way for film-loving friends to stay connected throughout the 2026 awards circuit.

**Target Launch:** January 8, 2026 (3 days before Golden Globes)  
**Primary Audience:** Your friend group + film lovers who want a casual way to compete

**Core Value Proposition:**
- Simple setup (just username + email)
- Mobile-first swipeable picks (makes it fun, not homework)
- Real-time scoring during ceremonies
- Built for conversation and connection, not just competition

---

## 2. Product Goals

### Primary Goals
1. **Connection:** Give friends a reason to text during award shows
2. **Accessibility:** Anyone can play, not just film buffs
3. **Fun First:** This is about hanging out, not serious predictions
4. **Season-Long:** Keep the group engaged from Globes → Oscars

### Non-Goals (for 2026)
- Public leaderboards or global competition
- Monetization or ads
- Complex stats/analytics
- Mobile app (web-only for now)

---

## 3. Technical Stack

### Infrastructure
- **Frontend:** React (already built)
- **Hosting:** Netlify
- **Database:** Supabase (Project: tvhamheesddrzeqnppxm)
- **Authentication:** Supabase Auth (email/password)
- **Storage:** Supabase Database + Real-time subscriptions

### Data Sources
- **TMDb API:** Nominee lists, movie metadata
  - API Key: `05d97b93f98ff236b536d2aff39935c7`
  - Docs: https://developer.themoviedb.org/docs/getting-started
- **Golden Globes:** Manual scrape from https://goldenglobes.com/nominations/2026
- **Live Results:** Manual admin entry during ceremonies

### Key Libraries
- **Supabase JS Client:** `@supabase/supabase-js`
- **React Router:** For league invite links
- **Framer Motion:** Card swipe animations (optional)

---

## 4. Database Schema (Supabase)

### Table: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_emoji TEXT DEFAULT '🎬',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `leagues`
```sql
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g., 'GLOBES-XJKR'
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `league_members`
```sql
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);
```

### Table: `events`
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY, -- e.g., 'golden-globes-2026'
  name TEXT NOT NULL,
  ceremony_date DATE NOT NULL,
  picks_lock_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT false,
  is_complete BOOLEAN DEFAULT false
);
```

### Table: `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT REFERENCES events(id),
  name TEXT NOT NULL, -- e.g., 'Best Picture - Drama'
  display_order INTEGER NOT NULL,
  base_points INTEGER NOT NULL, -- 50, 20, or 10
  emoji TEXT DEFAULT '🏆'
);
```

### Table: `nominees`
```sql
CREATE TABLE nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Film title or person name
  tmdb_id INTEGER, -- For pulling poster images
  display_order INTEGER NOT NULL
);
```

### Table: `ballots`
```sql
CREATE TABLE ballots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES events(id),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT false,
  UNIQUE(user_id, event_id, league_id)
);
```

### Table: `picks`
```sql
CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ballot_id UUID REFERENCES ballots(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  nominee_id UUID REFERENCES nominees(id),
  is_power_pick BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ballot_id, category_id)
);
```

### Table: `results`
```sql
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  winner_nominee_id UUID REFERENCES nominees(id),
  announced_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `scores`
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES events(id),
  total_points INTEGER DEFAULT 0,
  correct_picks INTEGER DEFAULT 0,
  power_picks_hit INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, league_id, event_id)
);
```

---

## 5. User Journey (Simplified)

### Phase 1: Sign Up & Create League (3 minutes)

**User Story:** Sarah wants to create a league for her friend group.

1. **Visit:** `reelrivals.netlify.app`
2. **Home Screen:**
   ```
   🎬 Reel Rivals
   Connect with friends through awards season
   
   [Sign Up] [Log In]
   ```
3. **Sign Up Form:**
   - Email: sarah@email.com
   - Username: SarahScreens
   - Password: ••••••••
   - Avatar emoji: 🎬 (from emoji picker)
   - [Create Account]
4. **Post-Signup:**
   - Auto-redirect to: "Create Your First League"
   - League name: "Film Club"
   - [Create League] → Generates code: `GLOBES-XJKR`
5. **Share Screen:**
   ```
   🎉 League Created!
   
   Share this link with friends:
   reelrivals.netlify.app/join/GLOBES-XJKR
   
   [Copy Link] [Text Friends]
   ```

### Phase 2: Join League (2 minutes)

**User Story:** Jake gets invited by Sarah.

1. **Receives Link:** `reelrivals.netlify.app/join/GLOBES-XJKR`
2. **Landing Page:**
   ```
   🎬 Reel Rivals
   
   Sarah invited you to "Film Club"
   Predict the 2026 Golden Globes together!
   
   [Sign Up to Join]
   ```
3. **Quick Signup:**
   - Email: jake@email.com
   - Username: JakeFromState
   - Password: ••••••••
   - Avatar: 🍿
4. **Auto-Join:** Immediately added to league, shown member list
5. **CTA:** "Golden Globes picks are open! Start now →"

### Phase 3: Make Picks (5-8 minutes)

**User Story:** Jake makes his Golden Globes predictions.

1. **Ballot Home:**
   ```
   🏆 Golden Globes 2026
   
   Picks lock: Jan 11, 5:00 PM PST
   ⏰ 2 days, 14 hours remaining
   
   Progress: 0/15 categories
   Power Picks: 3 available 🔥
   
   [Start Picking]
   ```

2. **Swipeable Cards:**
   - Category 1: Best Picture - Drama
   - See 5 nominee cards stacked
   - Swipe right = pick
   - Swipe up = power pick (3x multiplier)
   - Visual: Card flies off screen, next card appears
   
3. **Progress Indicators:**
   - Top: "1 / 15" counter
   - Power picks: 🔥🔥🔥 → 🔥🔥 → 🔥 → (empty)

4. **Completion:**
   ```
   ✅ Ballot Complete!
   
   You picked: 15/15 categories
   Power picks: 3 used
   
   [View My Picks] [See League]
   ```

### Phase 4: Pre-Ceremony Activity

**User Story:** Sarah checks on her league before the show.

1. **League Home:**
   ```
   📊 Film Club Leaderboard
   
   Golden Globes 2026
   Ceremony starts in 2 hours!
   
   4/4 members have submitted picks
   
   🎬 SarahScreens - Ready ✅
   🍿 JakeFromState - Ready ✅
   🎭 EmilyCinema - Ready ✅
   🎯 MikeMovies - Ready ✅
   
   [View Activity Feed]
   ```

2. **Activity Feed:**
   ```
   • Jake used a Power Pick on Best Actor 🔥 (2h ago)
   • Emily completed her ballot (5h ago)
   • Mike changed his Best Picture pick (1d ago)
   • Sarah invited 2 new friends (2d ago)
   ```

3. **Push Notification (2 hours before):**
   ```
   🎬 Golden Globes start in 2 hours!
   Tap to see your picks vs. your friends
   ```

### Phase 5: Live Ceremony (3 hours)

**User Story:** All friends watch together, app open during show.

1. **Live Mode Auto-Activates:**
   ```
   🔴 LIVE - Golden Globes 2026
   
   Next Category: Best Picture - Drama
   Your pick: One Battle After Another 🔥
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LIVE STANDINGS
   
   1. 🎭 Emily - 100 pts (+50) ⬆️
   2. 🎬 Sarah - 50 pts (+0)
   3. 🍿 Jake - 50 pts (+0)
   4. 🎯 Mike - 0 pts (-50) ⬇️
   
   [Send Reaction] 😎 🔥 😱 😭
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

2. **Winner Announced (Real-time):**
   - Admin enters winner in dashboard
   - Database updates via Supabase real-time
   - All users see instant update:
   ```
   🏆 WINNER: One Battle After Another
   
   ✅ YOU +150 PTS! (Power Pick!)
   ✅ SARAH +50 PTS
   ❌ EMILY
   ❌ MIKE
   
   [React: 🔥]
   ```

3. **Standings Update:**
   - Smooth animation, cards reorder
   - Confetti if you move to 1st place

### Phase 6: Post-Ceremony

**User Story:** Sarah finishes 2nd, wants to share results.

1. **Final Results Screen:**
   ```
   🏆 Golden Globes 2026 - Results
   
   🥇 EMILY - 350 pts
   🥈 YOU - 320 pts
   🥉 JAKE - 280 pts
   4th MIKE - 200 pts
   
   Your Stats:
   ✅ 12/15 correct (80%)
   🔥 2/3 power picks hit
   🎯 Best call: Best Actor
   
   [Share Results] [View Breakdown]
   ```

2. **Auto-Generated Share Card:**
   - Instagram story format (1080x1920)
   - Shows your rank, score, best pick
   - "I got 2nd in my Reel Rivals league! Can you beat me at the Grammys?"

3. **Bridge to Next Event:**
   ```
   🎵 Grammys 2026
   Nominations out now!
   Ceremony: Feb 1, 2026
   
   Your league continues...
   [Make Grammy Picks]
   ```

---

## 6. Core Features (MVP)

### 6.1 Authentication (Supabase Auth)
- Email/password signup
- Password reset via email
- Session management
- Protected routes

### 6.2 League Management
- Create league (auto-generates unique code)
- Join via `/join/:code` URL
- View league members
- Leave league option

### 6.3 Ballot System
- Fetch categories + nominees from database
- Swipeable card interface (right = pick, up = power pick)
- Save picks to Supabase in real-time
- Lock ballot at ceremony start time
- Edit picks before lock time

### 6.4 Scoring Engine
- Calculate points when results added:
  - Regular pick: base points (50/20/10)
  - Power pick: base points × 3
- Update `scores` table via database trigger
- Real-time score updates during ceremony

### 6.5 Live Mode
- Poll `results` table every 30 seconds during ceremony
- Display live leaderboard with point changes
- Show next category + your pick
- Reaction buttons (save to activity feed)

### 6.6 Admin Panel (Simple)
- Protected route: `/admin` (password-protected)
- Form to enter winners by category
- Inserts into `results` table
- Triggers score recalculation

---

## 7. Data Setup Workflow

### 7.1 TMDb API Integration

**Fetch Nominee Data:**
```javascript
// Example: Get movie details
const tmdbApiKey = '05d97b93f98ff236b536d2aff39935c7';
const movieId = 558449; // Example: Gladiator II

fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`)
  .then(res => res.json())
  .then(data => {
    console.log(data.title); // "Gladiator II"
    console.log(data.poster_path); // "/6z88f... "
  });
```

**Usage in App:**
- Store TMDb ID in `nominees` table
- Display poster images in ballot cards
- Fetch additional metadata (runtime, director, etc.)

### 7.2 Golden Globes Nominees (Manual Entry)

**Source:** https://goldenglobes.com/nominations/2026

**Process:**
1. Scrape nominee lists from official site
2. Create seed script: `scripts/seed-globes-2026.js`
3. Insert into Supabase:
   ```javascript
   // Example structure
   const globesData = {
     event: {
       id: 'golden-globes-2026',
       name: 'Golden Globes 2026',
       ceremony_date: '2026-01-11',
       picks_lock_at: '2026-01-11T17:00:00-08:00'
     },
     categories: [
       {
         name: 'Best Picture - Drama',
         base_points: 50,
         emoji: '🏆',
         nominees: [
           { name: 'One Battle After Another', tmdb_id: 123456 },
           { name: 'Marty Supreme', tmdb_id: 789012 }
         ]
       }
     ]
   };
   ```

### 7.3 Subsequent Events

**Schedule:**
- Grammys: Feb 1, 2026
- BAFTAs: Feb 22, 2026
- SAG Awards: March 1, 2026
- Oscars: March 15, 2026

**Process:**
- Repeat nominee data collection
- Create new event in `events` table
- Users can make picks for multiple events simultaneously

---

## 8. Supabase Setup Checklist

### 8.1 Initial Configuration

1. **Enable Row Level Security (RLS):**
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
   -- (Repeat for all tables)
   ```

2. **Create RLS Policies:**
   ```sql
   -- Example: Users can only read their own data
   CREATE POLICY "Users can view own profile"
     ON users FOR SELECT
     USING (auth.uid() = id);
   
   -- League members can view league data
   CREATE POLICY "Members can view league"
     ON leagues FOR SELECT
     USING (
       id IN (
         SELECT league_id FROM league_members
         WHERE user_id = auth.uid()
       )
     );
   ```

3. **Enable Real-time:**
   - Supabase Dashboard → Database → Replication
   - Enable real-time for: `results`, `scores`, `picks`

### 8.2 Database Triggers

**Auto-calculate scores when results added:**
```sql
CREATE OR REPLACE FUNCTION calculate_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate scores for all users in affected category
  UPDATE scores s
  SET 
    total_points = (
      SELECT SUM(
        CASE 
          WHEN p.nominee_id = NEW.winner_nominee_id 
          THEN c.base_points * (CASE WHEN p.is_power_pick THEN 3 ELSE 1 END)
          ELSE 0 
        END
      )
      FROM picks p
      JOIN ballots b ON p.ballot_id = b.id
      JOIN categories c ON p.category_id = c.id
      WHERE b.user_id = s.user_id 
        AND b.event_id = s.event_id
        AND b.league_id = s.league_id
    ),
    updated_at = NOW()
  WHERE s.event_id = (
    SELECT event_id FROM categories WHERE id = NEW.category_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_result_added
  AFTER INSERT ON results
  FOR EACH ROW
  EXECUTE FUNCTION calculate_scores();
```

---

## 9. Netlify Deployment

### 9.1 Environment Variables

**Netlify Dashboard → Site Settings → Environment Variables:**
```
VITE_SUPABASE_URL=https://tvhamheesddrzeqnppxm.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_TMDB_API_KEY=05d97b93f98ff236b536d2aff39935c7
```

### 9.2 Build Settings

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/join/:code"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 9.3 Deploy Command
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

---

## 10. Development Roadmap

### Week 1 (Jan 6-8): Core Setup
- ✅ Set up Supabase project
- ✅ Create database schema
- ✅ Seed Golden Globes data
- ✅ Basic auth flow (signup/login)
- ✅ Create/join league functionality

### Week 2 (Jan 8-11): Ballot & Scoring
- Build swipeable ballot UI
- Save picks to Supabase
- Lock ballots at ceremony time
- Admin panel for entering results
- Basic leaderboard

### Week 3 (Jan 11): Live Mode
- Real-time score updates (Supabase subscriptions)
- Live mode UI
- Push notifications (optional)
- Bug fixes + polish

### Post-Globes (Jan 12+): Iteration
- Add Grammys data
- Improve mobile experience
- Add more social features (activity feed)
- Collect user feedback

---

## 11. Open Questions & Decisions

### Technical
- **Image hosting:** Use TMDb CDN or upload to Supabase Storage?
- **Push notifications:** Use Supabase Edge Functions or skip for MVP?
- **Real-time polling:** 30 seconds or use Supabase real-time subscriptions?

### Product
- **Multiple leagues:** Can users join more than one league?
- **League privacy:** Public vs private leagues?
- **Editing picks:** Allow edits up until lock time or no changes after submit?
- **Mobile app:** Stay web-only or build native app later?

### Data
- **Nominee sources:** Stick with manual entry or automate via TMDb?
- **Historical data:** Save past events for stats or keep it simple?

---

## 12. Success Metrics (Casual)

### Launch Week (Jan 8-11)
- 10+ signups from friend group
- 80%+ ballot completion rate
- All friends active during Globes ceremony

### Season (Jan-March)
- 60%+ return for second event (Grammys)
- 5+ active group chat messages during each ceremony
- 40%+ complete all 5 events

### Qualitative
- "This was more fun than just texting during the show"
- Friends ask "Are we doing this for the Emmys too?"
- Group chat stays active between events

---

## 13. Next Steps

### Immediate (This Week)
1. **Set up Supabase tables** using schema above
2. **Seed Golden Globes data** (scrape from goldenglobes.com)
3. **Build auth flow** with Supabase Auth
4. **Create league system** (generate codes, join flow)

### This Weekend
5. **Build ballot UI** (swipeable cards)
6. **Hook up picks to database**
7. **Create admin panel**
8. **Deploy to Netlify**

### Before Jan 11
9. **Test with friends** (beta group of 5-10)
10. **Fix bugs**
11. **Send league invite links**
12. **Set up live mode**

---

**Document Version:** 2.0  
**Last Updated:** January 6, 2026  
**Project:** Reel Rivals  
**Stack:** React + Supabase + Netlify + TMDb API  
**Launch:** Golden Globes 2026 (Jan 11)