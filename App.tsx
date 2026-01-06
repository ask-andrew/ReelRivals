
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
import { getCurrentUser, onAuthStateChange, type AuthUser } from './src/auth';
import { supabase } from './src/supabase';
import StandingsSnippet from './components/StandingsSnippet';
import { getOrCreateDefaultLeague } from './src/leagues';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'ballot' | 'live' | 'leagues' | 'profile' | 'admin'>('home');
  const [ballot, setBallot] = useState<Ballot | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isBallotComplete, setIsBallotComplete] = useState(false);
  const [userLeagueId, setUserLeagueId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUserSession = async (currentUser: AuthUser | null) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          const { league, error } = await getOrCreateDefaultLeague(currentUser.id);
          if (!error && league) {
            setUserLeagueId(league.id);
          } else if (error) {
            setError('Failed to load user league');
          }
        }
      } catch (err) {
        setError('Failed to initialize user session');
        console.error('User session error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Check for existing user session
    getCurrentUser().then(handleUserSession).catch(err => {
      setError('Failed to check user session');
      setLoading(false);
    });

    // Set up auth state listener
    const subscription = onAuthStateChange(handleUserSession);

    return () => {
      subscription.then(sub => sub.unsubscribe());
    };
  }, []);

  useEffect(() => {
    // Generate some initial activities
    const initialActivities: Activity[] = [
      { id: '1', userId: 'emily', userName: 'EmilyOscar', message: "Emily just locked in her Best Picture pick! 🔥", timestamp: Date.now(), type: 'pick' },
      { id: '2', userId: 'jake', userName: 'JakeFromStateFarm', message: "Jake used a Power Pick on Best Actor 🍿", timestamp: Date.now() - 50000, type: 'power' },
      { id: '3', userId: 'sarah', userName: 'SarahScreens', message: "Sarah joined the league 'Globes Crew'", timestamp: Date.now() - 100000, type: 'join' },
    ];
    setActivities(initialActivities);
  }, []);

  const handleOnboardingComplete = (newUser: AuthUser) => {
    setUser(newUser);
  };

  const handleBallotComplete = (picks: Record<string, Pick>) => {
    const newBallot: Ballot = {
      userId: user?.id || '',
      eventId: 'golden-globes-2026',
      picks
    };
    setBallot(newBallot);
    setIsBallotComplete(true);
    setActiveTab('home');

    // Add activity
    const newActivity: Activity = {
      id: Math.random().toString(),
      userId: user?.id || '',
      userName: user?.username || '',
      message: "You just completed your ballot! Let's go! 🏆",
      timestamp: Date.now(),
      type: 'pick'
    };
    setActivities(prev => [newActivity, ...prev]);
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
        <div className="bg-gradient-to-br from-yellow-900/40 via-black to-black border border-yellow-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-700" />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1 rounded-full">
              <Calendar size={12} className="text-yellow-500" />
              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Starts Jan 11</span>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Event 01</div>
          </div>

          <h2 className="text-3xl font-cinzel font-bold mb-2">Golden Globes</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">The movie circuit begins. Secure your spot on the leaderboard before the curtain rises.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Ballot</p>
              <p className={`text-sm font-bold ${isBallotComplete ? 'text-green-500' : 'text-yellow-500'}`}>
                {isBallotComplete ? 'Locked In' : `${CATEGORIES.length} Picks Pending`}
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Power Picks</p>
              <p className="text-sm font-bold text-white">
                {ballot ? (Object.values(ballot.picks) as Pick[]).filter(p => p.isPowerPick).length : 0} / 3 Used
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('ballot')}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-2xl py-4 flex items-center justify-center space-x-2 transition-all shadow-xl shadow-yellow-900/20 active:scale-95"
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

        <StandingsSnippet onViewLeague={() => setActiveTab('leagues')} />

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
      {activeTab === 'leagues' && <div>Leagues coming soon...</div>}
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
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Season Badges</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {['🐴', '👁️', '🧹', '🔥'].map((emoji, i) => (
                <div key={i} className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl grayscale opacity-50 shrink-0">
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-gray-600 italic">Participate in more events to unlock badges</p>
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
