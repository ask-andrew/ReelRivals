
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';
import BallotSwiperDB from './components/BallotSwiperDB';
import LiveScoring from './components/LiveScoring';
import ActivityFeed from './components/ActivityFeed';
import ShareModal from './components/ShareModal';
import Analytics from './components/Analytics';
import { Trophy, Zap, ChevronRight, Share2, Calendar, Target, Check, BarChart3, Users } from 'lucide-react';
import { User, Ballot, Pick, League, Activity } from './types';
import { CATEGORIES, SEASON_CIRCUIT } from './constants';
import { getCategories, getBallot, saveBallotPicks, getOrCreateDefaultLeague, getAllPlayersWithScores, getCurrentUser, signOut, signupForEventNotifications, InstantUser } from './src/instantService';
import StandingsSnippet from './components/StandingsSnippet';
import { PlayerList } from './PlayerList';

const App: React.FC = () => {
  const [user, setUser] = useState<InstantUser | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'ballot' | 'live' | 'leagues' | 'profile' | 'admin' | 'analytics'>('home');
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isBallotComplete, setIsBallotComplete] = useState(false);
  const [userLeagueId, setUserLeagueId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standingsRefresh, setStandingsRefresh] = useState(0);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  
  // Golden Globes is completed - allow full viewing but no new picks
  const isGoldenGlobesCompleted = true;
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

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setBallot(null);
      setActivities([]);
      setIsBallotComplete(false);
      setUserLeagueId(null);
      setActiveTab('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
                      : 'bg-linear-to-br from-green-600/30 to-green-700/50 border-green-400/70 shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl">{event.icon}</span>
                    {isActive && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,1)]" />}
                    {!isActive && event.status === 'completed' && <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.8)]" />}
                  </div>
                  <h4 className="text-xs font-bold truncate mb-1">{event.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">{event.date}</p>
                  <div className="mt-3">
                    <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-yellow-500 text-black' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {event.status === 'open' ? 'Live Now' : event.status === 'completed' ? '✅ Completed' : event.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BAFTAs 2026 Promotion */}
        <div className="bg-linear-to-r from-blue-900/30 via-purple-900/20 to-blue-900/30 border border-blue-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-blue-400">🎬 BAFTAs 2026</h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold">Feb 15, 2026</span>
          </div>
          <p className="text-sm text-gray-300 mb-4">While you wait for BAFTAs predictions to open, review your Golden Globes performance and invite friends to join your league!</p>
          
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-blue-400">Analyze Your Performance</span>
              </div>
              <p className="text-[10px] text-gray-400">See how your picks compared to other critics and identify patterns for BAFTAs</p>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="mt-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-lg font-medium transition-colors w-full"
              >
                View Analytics
              </button>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Users size={14} className="text-green-400" />
                <span className="text-xs font-bold text-green-400">Invite Friends</span>
              </div>
              <p className="text-[10px] text-gray-400">More friends = bigger competition and bragging rights!</p>
              <button 
                onClick={() => setShareModalOpen(true)}
                className="mt-2 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg font-medium transition-colors w-full"
              >
                Invite to League
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Get notified when BAFTAs predictions open</p>
            <button 
              onClick={async () => {
                if (!user) return;
                
                try {
                  const result = await signupForEventNotifications(user.id, 'baftas-2026');
                  if (result.success) {
                    alert('🎬 You\'ll be notified when BAFTAs 2026 predictions open!');
                  } else {
                    alert('🎬 Something went wrong. Please try again.');
                  }
                } catch (error) {
                  console.error('Notification signup error:', error);
                  alert('🎬 Something went wrong. Please try again.');
                }
              }}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Notify Me
            </button>
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
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">The ceremony has concluded! Review your performance and prepare for BAFTAs.</p>
          
          {/* Event Status */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-bold text-green-400 uppercase tracking-wide">
                  Event Completed
                </span>
              </div>
              <span className="text-sm font-bold text-white">Golden Globes 2026</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 ml-4">
              The ceremony has concluded! Review your picks and see how you ranked against other critics.
            </p>
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
            className="w-full bg-green-500 hover:bg-green-400 text-white font-black rounded-2xl py-4 flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] active:scale-95"
          >
            <Check size={18} strokeWidth={2.5} />
            <span className="uppercase tracking-[0.15em] text-xs">View Your Ballot</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Analytics Preview */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 size={20} className="text-yellow-500" />
              <h3 className="text-lg font-bold text-white">Golden Globes Analytics</h3>
            </div>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold underline transition-colors"
            >
              View Full Report
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-cinzel font-bold text-yellow-500 mb-1">📊</p>
              <p className="text-xs text-gray-400">Performance Insights</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-cinzel font-bold text-blue-500 mb-1">👥</p>
              <p className="text-xs text-gray-400">Community Trends</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-cinzel font-bold text-green-500 mb-1">⚡</p>
              <p className="text-xs text-gray-400">Power Pick Analysis</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-300 mb-3">Discover patterns in your predictions and see how you compare to other critics. Use these insights to dominate BAFTAs!</p>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <BarChart3 size={16} />
            <span>Analyze Your Performance</span>
          </button>
        </div>

        <StandingsSnippet onViewLeague={() => setActiveTab('leagues')} refreshTrigger={standingsRefresh} />

        <ActivityFeed activities={activities} />
        
        <div className="flex justify-center pb-8">
          <button 
            onClick={() => setShareModalOpen(true)}
            className="flex items-center space-x-2 text-yellow-500/60 hover:text-yellow-500 transition-colors mr-4"
          >
            <Share2 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Invite to League</span>
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors border border-green-500/30"
          >
            <Trophy size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">View Final Standings</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut}>
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
          isLive={true} 
        />
      )}
      {activeTab === 'leagues' && <PlayerList refreshTrigger={standingsRefresh} />}
      {activeTab === 'analytics' && (
        <Analytics 
          leagueId={userLeagueId || 'default'} 
          eventId="golden-globes-2026" 
        />
      )}
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

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Season Achievements</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
                <span className="text-[10px] text-gray-400 font-medium">0 of {SEASON_BADGES.length} unlocked</span>
                <div className="h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-yellow-500/10 via-orange-500/5 to-yellow-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-black/40 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                  {SEASON_BADGES.map((badge, index) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 via-purple-500/5 to-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
              <div className="relative bg-linear-to-br from-gray-900/80 to-black/60 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm group-hover:border-yellow-500/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-linear-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-sm font-bold">?</span>
                  </div>
                  <h4 className="text-lg font-bold text-yellow-500">How to Unlock Achievements</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg group-hover:bg-green-500/10 transition-colors">
                    <span className="text-green-400 text-lg mt-0.5">🎬</span>
                    <div>
                      <span className="text-green-400 font-bold text-sm">Participation</span>
                      <p className="text-gray-300 text-[10px] mt-1">Submit ballots and engage with events throughout the season</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                    <span className="text-blue-400 text-lg mt-0.5">🎯</span>
                    <div>
                      <span className="text-blue-400 font-bold text-sm">Accuracy</span>
                      <p className="text-gray-300 text-[10px] mt-1">Make correct predictions and achieve perfect scores</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg group-hover:bg-yellow-500/10 transition-colors">
                    <span className="text-yellow-400 text-lg mt-0.5">⚡</span>
                    <div>
                      <span className="text-yellow-400 font-bold text-sm">Strategy</span>
                      <p className="text-gray-300 text-[10px] mt-1">Master the art of power picks and tactical gameplay</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                    <span className="text-purple-400 text-lg mt-0.5">🏆</span>
                    <div>
                      <span className="text-purple-400 font-bold text-sm">Victory</span>
                      <p className="text-gray-300 text-[10px] mt-1">Dominate events and claim your place in cinema history</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-center text-[10px] text-gray-400 italic">
                    <span className="text-yellow-500 font-bold">Pro Tip:</span> Each achievement unlocks unique bragging rights and showcases your expertise as a film critic!
                  </p>
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
