
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';
import BallotSwiperDB from './components/BallotSwiperDB';
import LiveScoring from './components/LiveScoring';
import EnhancedLiveScoring from './components/EnhancedLiveScoring';
import ActivityFeed from './components/ActivityFeed';
import ShareModal from './components/ShareModal';
import Analytics from './components/Analytics';
import MobileAnalytics from './components/MobileAnalytics';
import AwardShowSelector from './components/AwardShowSelector';
import BaftaAnnouncementBanner from './components/BaftaAnnouncementBanner';
import SocialShare from './components/SocialShare';
import { Trophy, Zap, ChevronRight, Share2, Calendar, Target, Check, BarChart3, Users } from 'lucide-react';
import { User, Ballot, Pick, League, Activity } from './types';
import { CATEGORIES, SEASON_CIRCUIT, AWARD_SHOW_CATEGORIES } from './constants';
import { getCategories, getBallot, saveBallotPicks, getOrCreateDefaultLeague, getAllPlayersWithScores, getCurrentUser, signOut, signupForEventNotifications, InstantUser } from './src/instantService';
import StandingsSnippet from './components/StandingsSnippet';
import { PlayerList } from './PlayerList';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<InstantUser | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'ballot' | 'live' | 'leagues' | 'profile' | 'admin' | 'analytics'>('home');
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isBallotComplete, setIsBallotComplete] = useState(false);
  const [userLeagueId, setUserLeagueId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [baftaBannerVisible, setBaftaBannerVisible] = useState(false);
  const [socialShareOpen, setSocialShareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [standingsRefresh, setStandingsRefresh] = useState(0);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [selectedAwardShow, setSelectedAwardShow] = useState('oscars-2026'); // Default to Oscars since they're open
  
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

  const sharePicks = ballot?.picks
    ? Object.entries(ballot.picks).map(([categoryId, pick]) => {
        const category = dbCategories.find((cat) => cat.id === categoryId);
        const nominee = category?.nominees?.find((nom: any) => nom.id === pick.nomineeId);
        return {
          nomineeName: nominee?.name || pick.nomineeId,
          nominee
        };
      })
    : [];

  useEffect(() => {
    const initSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const [{ categories: cats, error: catsError }, { league, error }] = await Promise.all([
            getCategories(selectedAwardShow),
            getOrCreateDefaultLeague(currentUser.id)
          ]);
          
          if (catsError) throw catsError;
          setDbCategories(cats || []);
          
          if (league) {
            setUserLeagueId(league.id);
          }
          
          // Check if user has an existing ballot to set completion status
          const existingBallot = await getBallot(currentUser.id, selectedAwardShow);
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
              eventId: selectedAwardShow,
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

  // Check BAFTA event status and show banner if open
  useEffect(() => {
    const baftaEvent = SEASON_CIRCUIT.find(event => event.id === 'baftas-2026');
    if (baftaEvent && baftaEvent.status === 'open') {
      setBaftaBannerVisible(true);
    } else {
      setBaftaBannerVisible(false);
    }
  }, []);

  // Reload data when award show changes
  useEffect(() => {
    if (user) {
      const loadAwardShowData = async () => {
        try {
          setLoading(true);
          const { categories: cats, error: catsError } = await getCategories(selectedAwardShow);
          
          if (catsError) throw catsError;
          setDbCategories(cats || []);
          
          // Load ballot for new award show
          const ballotData = await getBallot(user.id, selectedAwardShow);
          if (ballotData && ballotData.picks) {
            const completedCount = ballotData.picks.length;
            setIsBallotComplete(completedCount === (cats || []).length);
            
            const picksMap: Record<string, Pick> = {};
            ballotData.picks.forEach((pick: any) => {
              picksMap[pick.category_id] = {
                nomineeId: pick.nominee_id,
                isPowerPick: pick.is_power_pick
              };
            });
            setBallot({
              userId: user.id,
              eventId: selectedAwardShow,
              picks: picksMap
            });
          } else {
            setBallot({
              userId: user.id,
              eventId: selectedAwardShow,
              picks: {}
            });
            setIsBallotComplete(false);
          }
        } catch (err) {
          console.error('Error loading award show data:', err);
          setError('Failed to load award show data');
        } finally {
          setLoading(false);
        }
      };
      
      loadAwardShowData();
    }
  }, [selectedAwardShow, user]);

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
        const refreshedBallot = await getBallot(user.id, selectedAwardShow);
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
        {/* Quick Actions - Above Everything Else */}
        <div className="bg-linear-to-r from-yellow-900/60 via-yellow-800/40 to-yellow-900/60 border border-yellow-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl" />
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-yellow-400">Make Your Picks</h2>
            <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
              Live Now
            </div>
          </div>
          
          <p className="text-sm text-gray-300 mb-6">Choose your winners for the biggest awards of the season!</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                setSelectedAwardShow('oscars-2026');
                setActiveTab('ballot');
              }}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl py-3 px-4 transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] active:scale-95"
            >
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs font-bold">Oscars</div>
              <div className="text-[8px] opacity-80">10 Categories</div>
            </button>
            
            <button 
              onClick={() => {
                setSelectedAwardShow('baftas-2026');
                setActiveTab('ballot');
              }}
              className="bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl py-3 px-4 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] active:scale-95"
            >
              <div className="text-2xl mb-1">🎬</div>
              <div className="text-xs font-bold">BAFTAs</div>
              <div className="text-[8px] opacity-80">10 Categories</div>
            </button>

            <button 
              onClick={() => {
                setSelectedAwardShow('sag-2026');
                setActiveTab('ballot');
              }}
              className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl py-3 px-4 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] active:scale-95"
            >
              <div className="text-2xl mb-1">👥</div>
              <div className="text-xs font-bold">SAG Awards</div>
              <div className="text-[8px] opacity-80">10 Categories</div>
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-cinzel font-bold">Welcome, {user.username}</h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium">Reel Rivals Circuit 2026</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500 text-black text-2xl flex items-center justify-center rounded-2xl shadow-lg shadow-yellow-900/20">
            {user.avatar_emoji}
          </div>
        </div>

        {/* Season Circuit Roadmap - Reorganized for Current Focus */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">2026 Awards Season</h3>
            <span className="text-[10px] text-green-500 font-bold uppercase">{activeEvents} Events Open</span>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {SEASON_CIRCUIT.map((event) => {
              const isActive = event.status === 'open';
              const isCompleted = event.status === 'completed';
              return (
                <div 
                  key={event.id}
                  className={`snap-center shrink-0 w-40 rounded-2xl p-4 border transition-all duration-300 ${
                    isActive 
                      ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                      : isCompleted
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl">{event.icon}</span>
                    {isActive && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,1)]" />}
                    {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.8)]" />}
                  </div>
                  <h4 className="text-xs font-bold truncate mb-1">{event.name}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">{event.date}</p>
                  <div className="mt-3">
                    <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-yellow-500 text-black' : isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {isActive ? 'Open Now' : isCompleted ? '✅ Completed' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Season Focus */}
        <div className="bg-linear-to-r from-yellow-900/40 via-black to-blue-900/40 border border-yellow-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-700" />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1 rounded-full">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Season In Progress</span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">1 Down, 3 To Go</div>
          </div>

          <h2 className="text-2xl font-cinzel font-bold mb-2">The Circuit Continues</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">Golden Globes are complete! Now focus on BAFTAs, SAG, and Oscars to climb the standings.</p>
          
          {/* Current Events Status */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🎭</span>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-yellow-400">BAFTAs</h4>
              <p className="text-[10px] text-gray-400">Feb 22, 2026</p>
              <p className="text-[8px] text-yellow-300 mt-1">Open for Picks</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">👥</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-emerald-400">SAG Awards</h4>
              <p className="text-[10px] text-gray-400">Mar 1, 2026</p>
              <p className="text-[8px] text-emerald-300 mt-1">Open for Picks</p>
            </div>
            
            <div className="col-span-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">✨</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-blue-400">Oscars</h4>
              <p className="text-[10px] text-gray-400">Mar 15, 2026</p>
              <p className="text-[8px] text-blue-300 mt-1">Open for Picks</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-green-400">Golden Globes Complete</span>
              <span className="text-[8px] text-green-400">✅ Results Available</span>
            </div>
            <p className="text-[10px] text-gray-400">Review your performance and use insights to dominate the rest of the season!</p>
          </div>
          
          <button 
            onClick={() => {
              setSelectedAwardShow('golden-globes-2026');
              setActiveTab('analytics');
            }}
            className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <BarChart3 size={16} />
            <span>Review Golden Globes Analytics</span>
          </button>
        </div>

        {/* Your Progress Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Your Progress</h3>
            <button 
              onClick={() => setActiveTab('ballot')}
              className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold underline transition-colors"
            >
              View Ballot
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                {SEASON_CIRCUIT.find(event => event.id === selectedAwardShow)?.name || 'Awards'}
              </p>
              <p className={`text-sm font-bold ${isBallotComplete ? 'text-green-500' : 'text-yellow-500'}`}>
                {ballot ? Object.keys(ballot.picks).length : 0} / {dbCategories.length || 10} Picks
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Power Picks</p>
              <p className="text-sm font-bold text-white">
                {ballot ? (Object.values(ballot.picks) as Pick[]).filter(p => p.isPowerPick).length : 0} / 3 Used
              </p>
            </div>
          </div>
        </div>

        <StandingsSnippet onViewLeague={() => setActiveTab('leagues')} refreshTrigger={standingsRefresh} eventId={selectedAwardShow} />

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
      {/* BAFTA Announcement Banner */}
      {baftaBannerVisible && (
        <BaftaAnnouncementBanner
          onClose={() => setBaftaBannerVisible(false)}
          onSubmitPicks={() => {
            setSelectedAwardShow('baftas-2026');
            setActiveTab('ballot');
            setBaftaBannerVisible(false);
          }}
          onShare={() => setSocialShareOpen(true)}
          userId={user?.id}
        />
      )}
      
      {/* Social Share Modal */}
      <SocialShare
        isOpen={socialShareOpen}
        onClose={() => setSocialShareOpen(false)}
        userPicks={sharePicks}
        userName={user?.username}
      />

      {activeTab === 'home' && renderHome()}
      {activeTab === 'ballot' && (
        <div className="space-y-4">
          {/* Award Show Selector - More Prominent */}
          <div className="bg-linear-to-r from-yellow-900/40 via-black to-yellow-900/40 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">Choose Your Award Show</h2>
              <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Make Picks
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSelectedAwardShow('oscars-2026')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedAwardShow === 'oscars-2026' 
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm font-bold">Oscars</div>
                <div className="text-[8px] opacity-70">Mar 15, 2026</div>
              </button>
              
              <button 
                onClick={() => setSelectedAwardShow('baftas-2026')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedAwardShow === 'baftas-2026' 
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">🎬</div>
                <div className="text-sm font-bold">BAFTAs</div>
                <div className="text-[8px] opacity-70">Feb 22, 2026</div>
              </button>

              <button 
                onClick={() => setSelectedAwardShow('sag-2026')}
                className={`col-span-2 p-4 rounded-xl border-2 transition-all ${
                  selectedAwardShow === 'sag-2026' 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-bold">SAG Awards</div>
                <div className="text-[8px] opacity-70">Mar 1, 2026</div>
              </button>
            </div>
          </div>
          
          <BallotSwiperDB 
            onComplete={handleBallotComplete} 
            userId={user?.id || ''} 
            leagueId={userLeagueId || 'default'} 
            eventId={selectedAwardShow}
          />
        </div>
      )}
      {activeTab === 'live' && (
        isMobile ? (
          <EnhancedLiveScoring 
            eventId={selectedAwardShow} 
            leagueId={userLeagueId || 'default'} 
            isLive={true} 
          />
        ) : (
          <LiveScoring 
            eventId={selectedAwardShow} 
            leagueId={userLeagueId || 'default'} 
            isLive={true} 
          />
        )
      )}
      {activeTab === 'leagues' && <PlayerList refreshTrigger={standingsRefresh} />}
      {activeTab === 'analytics' && (
        isMobile ? (
          <MobileAnalytics 
            leagueId={userLeagueId || 'default'} 
            eventId={selectedAwardShow} 
          />
        ) : (
          <Analytics 
            leagueId={userLeagueId || 'default'} 
            eventId={selectedAwardShow} 
          />
        )
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
