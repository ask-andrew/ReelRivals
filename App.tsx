
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';
import BallotSwiperDB from './components/BallotSwiperDB';
import LiveScoring from './components/LiveScoring';
import ActivityFeed from './components/ActivityFeed';
import ShareModal from './components/ShareModal';
import { Trophy, Zap, ChevronRight, Share2, Calendar, Target } from 'lucide-react';
import { User, Ballot, Pick, League, Activity } from './types';
import { CATEGORIES, SEASON_CIRCUIT } from './constants';
import { getCurrentUser, getOrCreateDefaultLeague, signOut, getBallot, getCategories } from './src/instantService';
import type { InstantUser } from './src/instant';
import StandingsSnippet from './components/StandingsSnippet';
import { PlayerList } from './PlayerList';

const App: React.FC = () => {
  const [user, setUser] = useState<InstantUser | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'ballot' | 'live' | 'leagues' | 'profile' | 'admin'>('home');
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isBallotComplete, setIsBallotComplete] = useState(false);
  const [userLeagueId, setUserLeagueId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standingsRefresh, setStandingsRefresh] = useState(0);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const SEASON_BADGES = [
  {
    id: 'first-ballot',
    emoji: '🎬',
    name: 'First Timer',
    description: 'Submit your first ballot',
    unlocked: false,
    category: 'participation'
  },
  {
    id: 'perfect-picks',
    emoji: '👁️',
    name: 'Eagle Eye',
    description: 'Get 10+ correct picks in one event',
    unlocked: false,
    category: 'accuracy'
  },
  {
    id: 'power-player',
    emoji: '⚡',
    name: 'Power Player',
    description: 'Use all 3 power picks correctly',
    unlocked: false,
    category: 'strategy'
  },
  {
    id: 'circuit-champion',
    emoji: '🏆',
    name: 'Circuit Champion',
    description: 'Win an event overall',
    unlocked: false,
    category: 'victory'
  },
  {
    id: 'consistent',
    emoji: '📈',
    name: 'Consistent Critic',
    description: 'Submit ballots for 3+ events',
    unlocked: false,
    category: 'participation'
  },
  {
    id: 'perfect-event',
    emoji: '🎯',
    name: 'Perfect Score',
    description: 'Get 100% correct picks in an event',
    unlocked: false,
    category: 'accuracy'
  }
];

const BadgeCard: React.FC<{ badge: typeof SEASON_BADGES[0] }> = ({ badge }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative shrink-0">
      <div
        className={`w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 cursor-pointer shrink-0 ${
          badge.unlocked 
            ? 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 hover:scale-105' 
            : 'grayscale opacity-50 hover:opacity-70'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {badge.emoji}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-black/95 border border-yellow-500/30 rounded-lg p-3 shadow-xl z-50">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{badge.emoji}</span>
            <span className={`text-sm font-bold ${badge.unlocked ? 'text-yellow-500' : 'text-gray-400'}`}>
              {badge.name}
            </span>
          </div>
          <p className="text-[10px] text-gray-300 leading-relaxed">{badge.description}</p>
          <div className="mt-2 text-[8px] text-gray-500 uppercase tracking-widest">
            {badge.category}
          </div>
          {badge.unlocked && (
            <div className="mt-1 text-[8px] text-green-500 font-bold">✓ UNLOCKED</div>
          )}
        </div>
      )}
    </div>
  );
};

  useEffect(() => {
    const initSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const [{ categories: cats, error: catsError }, { league, error }] = await Promise.all([
            getCategories('golden-globes-2026'),
            getOrCreateDefaultLeague(currentUser.id)
          ]);
          
          if (catsError) throw catsError;
          setDbCategories(cats || []);
          
          if (league) {
            setUserLeagueId(league.id);
          }
          
          // Check if user has an existing ballot to set completion status
          const existingBallot = await getBallot(currentUser.id, 'golden-globes-2026');
          if (existingBallot && existingBallot.picks) {
            const completedCount = existingBallot.picks.length;
            setIsBallotComplete(completedCount === (cats?.length || 0));
            
            // Convert picks to the expected format
            const picksMap: Record<string, Pick> = {};
            existingBallot.picks.forEach((pick: any) => {
              picksMap[pick.category_id] = {
                nomineeId: pick.nominee_id,
                isPowerPick: pick.is_power_pick
              };
            });
            
            setBallot({
              userId: currentUser.id,
              eventId: 'golden-globes-2026',
              picks: picksMap
            });
          }
        }
      } catch (err) {
        console.error('Session init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const handleOnboardingComplete = (newUser: InstantUser) => {
    setUser(newUser);
  };

  const handleBallotComplete = async (picks: Record<string, Pick>) => {
    const newBallot: Ballot = {
      userId: user?.id || '',
      eventId: 'golden-globes-2026',
      picks
    };
    setBallot(newBallot);
    setIsBallotComplete(true);
    setActiveTab('home');

    // Add real activity for this user
    const newActivity: Activity = {
      id: Math.random().toString(),
      userId: user?.id || '',
      userName: user?.username || '',
      message: `${user?.username} just completed their ballot! Let's go! 🏆`,
      timestamp: Date.now(),
      type: 'pick'
    };
    setActivities(prev => [newActivity, ...prev]);

    // Refresh the ballot from database to ensure consistency
    try {
      if (user) {
        const refreshedBallot = await getBallot(user.id, 'golden-globes-2026');
        if (refreshedBallot && refreshedBallot.picks) {
          const completedCount = refreshedBallot.picks.length;
          setIsBallotComplete(completedCount === dbCategories.length);
          
          // Convert picks to the expected format
          const picksMap: Record<string, Pick> = {};
          refreshedBallot.picks.forEach((pick: any) => {
            picksMap[pick.category_id] = {
              nomineeId: pick.nominee_id,
              isPowerPick: pick.is_power_pick
            };
          });
          
          setBallot({
            userId: user.id,
            eventId: 'golden-globes-2026',
            picks: picksMap
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing ballot after completion:', error);
    }

    // Trigger standings refresh
    setStandingsRefresh(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading Reel Rivals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-danger text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-black px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderHome = () => {
    const completedEvents = SEASON_CIRCUIT.filter(e => e.status === 'completed').length;
    const activeEvents = SEASON_CIRCUIT.filter(e => e.status === 'open').length;
    
    return (
      <div className="space-y-8 py-8 px-6">
        {/* Profile Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-cinzel font-bold">Welcome, {user.username}</h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium">Reel Rivals Circuit 2026</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500 text-black text-2xl flex items-center justify-center rounded-2xl shadow-lg shadow-yellow-900/20">
            {user.avatar_emoji}
          </div>
        </div>

        {/* Season Circuit Roadmap */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">The 2026 Circuit</h3>
            <span className="text-[10px] text-yellow-500 font-bold uppercase">{completedEvents + activeEvents} / {SEASON_CIRCUIT.length} Events</span>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {SEASON_CIRCUIT.map((event) => {
              const isActive = event.status === 'open';
              return (
                <div 
                  key={event.id}
                  className={`snap-center shrink-0 w-40 rounded-2xl p-4 border transition-all duration-300 ${
                    isActive 
                      ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                      : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl">{event.icon}</span>
                    {isActive && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,1)]" />}
                  </div>
                  <h4 className="text-xs font-bold truncate mb-1">{event.name}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">{event.date}</p>
                  <div className="mt-3">
                    <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'
                    }`}>
                      {event.status === 'open' ? 'Live Now' : event.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Focus Card (Next Event) */}
        <div className="bg-linear-to-br from-yellow-900/40 via-black to-black border border-yellow-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-700" />
          
          {/* Beta Badge */}
          <div className="absolute bottom-4 right-4 bg-yellow-500/80 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            Beta
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1 rounded-full">
              <Calendar size={12} className="text-yellow-500" />
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Jan 5, 2026 • 5:00pm PT</span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Event 01</div>
          </div>

          <h2 className="text-3xl font-cinzel font-bold mb-2">Golden Globes</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The movie circuit begins. Secure your spot on the leaderboard before the curtain rises.</p>
          
          {/* Deadline Countdown */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Picks Lock In</span>
              </div>
              <span className="text-sm font-bold text-white">Jan 11, 2026 @ 3pm PT</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 ml-4">Make your picks before the show starts!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Ballot</p>
              <p className={`text-sm font-bold ${isBallotComplete ? 'text-green-500' : 'text-yellow-500'}`}>
                {isBallotComplete ? 'Locked In' : `${ballot ? Object.keys(ballot.picks).length : 0} of ${dbCategories.length || CATEGORIES.length} Picks`}
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Power Picks</p>
                <div className="group relative">
                  <Zap size={14} className="text-yellow-500 cursor-help" />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-yellow-500/30 rounded-lg p-3 shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-sm">
                    <p className="text-[10px] text-gray-300 leading-relaxed">
                      <strong className="text-yellow-500 block mb-1">High Stakes Strategy</strong>
                      Select your 3 most confident categories. Correct picks earn <span className="text-white font-bold">2x points</span>. Choose wisely!
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm font-bold text-white mb-2">
                {ballot ? (Object.values(ballot.picks) as Pick[]).filter(p => p.isPowerPick).length : 0} / 3 Used
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                Select 3 categories to earn <span className="text-yellow-500 font-bold">2x points</span>.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('ballot')}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-2xl py-4 flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] active:scale-95"
          >
            <Target size={18} strokeWidth={2.5} />
            <span className="uppercase tracking-[0.15em] text-xs">{isBallotComplete ? 'Modify Ballot' : 'Make Your Picks'}</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Cumulative Scoring Highlight */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center space-x-4">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
            <Trophy size={20} className="text-yellow-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-0.5">Circuit Championship</h4>
            <p className="text-[10px] text-gray-500 leading-snug">Every event counts towards your season total. Win the overall crown on Oscar night.</p>
          </div>
        </div>

        <StandingsSnippet onViewLeague={() => setActiveTab('leagues')} refreshTrigger={standingsRefresh} />

        <ActivityFeed activities={activities} />
        
        <div className="flex justify-center pb-8">
          <button 
            onClick={() => setShareModalOpen(true)}
            className="flex items-center space-x-2 text-yellow-500/60 hover:text-yellow-500 transition-colors"
          >
            <Share2 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Invite to League</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'ballot' && (
        <BallotSwiperDB 
          onComplete={handleBallotComplete} 
          userId={user?.id || ''} 
          leagueId={userLeagueId || 'default'} 
        />
      )}
      {activeTab === 'live' && (
        <LiveScoring 
          eventId="golden-globes-2026" 
          leagueId={userLeagueId || 'default'} 
          isLive={false} 
        />
      )}
      {activeTab === 'leagues' && <PlayerList refreshTrigger={standingsRefresh} />}
      {activeTab === 'profile' && (
        <div className="space-y-8 py-8 px-6">
          {/* Profile Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-cinzel font-bold">Welcome, {user.username}</h1>
              <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium">Reel Rivals Circuit 2026</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 text-black text-2xl flex items-center justify-center rounded-2xl shadow-lg shadow-yellow-900/20">
              {user.avatar_emoji}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Trophy size={20} className="mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-cinzel font-bold">0</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gold Medals</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Zap size={20} className="mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-cinzel font-bold">350</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Season Pts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Season Badges</h3>
              <span className="text-[10px] text-gray-400">0 of {SEASON_BADGES.length} unlocked</span>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {SEASON_BADGES.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-bold text-yellow-500 mb-2">How to Unlock Badges</h4>
              <div className="space-y-2 text-[10px] text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">🎬</span>
                  <span><strong>Participation:</strong> Submit ballots and engage with events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">🎯</span>
                  <span><strong>Accuracy:</strong> Make correct predictions and perfect scores</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">⚡</span>
                  <span><strong>Strategy:</strong> Use power picks wisely</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-500">🏆</span>
                  <span><strong>Victory:</strong> Win events and dominate the circuit</span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full text-red-900 font-bold py-4 text-[10px] tracking-[0.2em] uppercase mt-8 opacity-40 hover:opacity-100 transition-opacity">Reset Season Progress</button>
        </div>
      )}
      
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        type="invite"
        data={{ leagueCode: 'REELRIVALS' }}
      />
    </Layout>
  );
};

export default App;
