import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Zap, Award, Filter, RefreshCw, Calendar, TrendingDown, TrendingUp as ArrowTrendingUp, Trophy, Target, Flame, Crown, AlertTriangle, Share2, MessageCircle, Twitter, Link } from 'lucide-react';
import { getAnalyticsData } from '../src/instantService';
import type { Ballot, Category } from '../src/ballots';
import { SEASON_CIRCUIT } from '../constants';
import PowerScale from './PowerScale';
import VoterOverlap from './VoterOverlap';
import AwardsFunnel from './AwardsFunnel';
import SwipeableAnalyticsCards from './SwipeableAnalyticsCards';

interface TrendData {
  nomineeId: string;
  nomineeName: string;
  currentEvent: { count: number; percentage: number };
  previousEvents: Array<{ eventId: string; eventName: string; count: number; percentage: number }>;
  trend: 'up' | 'down' | 'stable' | 'new';
  trendPercentage: number;
}

interface AnalyticsData {
  totalBallots: number;
  nomineePopularity: Record<string, { 
    name: string; 
    count: number; 
    percentage: number; 
    powerPickCount: number;
    correctPicks: number;
    accuracy: number;
    isWinner: boolean;
  }>;
  powerPickAnalysis: Record<string, { 
    nomineeName: string; 
    count: number; 
    category: string;
    successRate: number;
  }>;
  categoryAnalytics: Record<string, { 
    categoryName: string; 
    totalPicks: number; 
    uniqueNominees: number;
    winnerNomineeId: string;
    winnerNomineeName: string;
    consensusCorrect: boolean;
    upset: boolean;
    mostPopularPick: any;
  }>;
  overallStats: {
    totalPicks: number;
    totalCorrectPicks: number;
    totalPowerPicks: number;
    correctPowerPicks: number;
    overallAccuracy: number;
    powerPickSuccessRate: number;
  };
  insights: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

const MobileAnalytics: React.FC<{ leagueId: string; eventId: string }> = ({ leagueId, eventId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get award show name for share messages
  const getAwardShowName = (eventId: string) => {
    const show = SEASON_CIRCUIT.find(s => s.id === eventId);
    return show ? show.name : 'Awards Show';
  };

  const getAwardShowYear = (eventId: string) => {
    const show = SEASON_CIRCUIT.find(s => s.id === eventId);
    return show ? show.name.split(' ').pop() : '2026';
  };
  const [excludeTestUsers, setExcludeTestUsers] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Test user detection patterns
  const isTestUser = (username: string) => {
    const testPatterns = [
      /^test/i,
      /^demo/i,
      /^admin/i,
      /^sample/i,
      /user\d+/i,
      /^.*_test$/i,
      /^test_.*$/i
    ];
    return testPatterns.some(pattern => pattern.test(username));
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { analytics, error: analyticsError } = await getAnalyticsData(leagueId, eventId);

      if (analyticsError) throw analyticsError;

      setAnalyticsData(analytics);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [leagueId, eventId, excludeTestUsers, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-danger text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Analytics Error</h2>
          <p className="text-text-secondary mb-4">{error || 'No data available'}</p>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)} 
            className="bg-primary text-black px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Sort nominees by popularity
  const sortedNominees = (Object.entries(analyticsData.nomineePopularity) as [string, { name: string; count: number; percentage: number; powerPickCount: number; accuracy: number; isWinner: boolean }][])
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15);

  // Sort power picks by success rate
  const sortedPowerPicks = (Object.entries(analyticsData.powerPickAnalysis) as [string, { nomineeName: string; count: number; category: string; successRate: number }][])
    .sort(([, a], [, b]) => b.successRate - a.successRate)
    .slice(0, 10);

  // Get upsets and consensus categories
  const upsets = Object.entries(analyticsData.categoryAnalytics)
    .filter(([, data]: [string, any]) => data.upset)
    .sort(([, a], [, b]: [string, any]) => (b as any).mostPopularPick.percentage - (a as any).mostPopularPick.percentage)
    .slice(0, 5) as [string, any][];

  const consensusCategories = Object.entries(analyticsData.categoryAnalytics)
    .filter(([, data]: [string, any]) => data.consensusCorrect)
    .slice(0, 5) as [string, any][];

  // Create card components for swipeable interface
  const analyticsCards = [
    // Share Results Card
    <div key="share" className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
        <Share2 className="w-5 h-5 mr-2" />
        Share Your Results
      </h3>
      <p className="text-gray-400 text-sm mb-4 italic">📤 Let friends see how you did</p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              const awardShowName = getAwardShowName(eventId);
              const awardShowYear = getAwardShowYear(eventId);
              const text = `🏆 My ${awardShowName} ${awardShowYear} Results!\n🎯 Accuracy: ${analyticsData.overallStats.overallAccuracy.toFixed(1)}%\n⚡ Power Picks: ${analyticsData.overallStats.correctPowerPicks}/${analyticsData.overallStats.totalPowerPicks} correct\n\nThink you can do better? Join Reel Rivals! 🎭`;
              const url = window.location.href;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }}
            className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Twitter size={16} />
            <span className="text-sm">Twitter</span>
          </button>
          
          <button 
            onClick={() => {
              const awardShowName = getAwardShowName(eventId);
              const awardShowYear = getAwardShowYear(eventId);
              const text = `🏆 My ${awardShowName} ${awardShowYear} Results!\n🎯 Accuracy: ${analyticsData.overallStats.overallAccuracy.toFixed(1)}%\n⚡ Power Picks: ${analyticsData.overallStats.correctPowerPicks}/${analyticsData.overallStats.totalPowerPicks} correct\n\nThink you can do better? Join Reel Rivals! 🎭`;
              navigator.clipboard.writeText(text);
            }}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <MessageCircle size={16} />
            <span className="text-sm">iMessage</span>
          </button>
        </div>
      </div>
    </div>,

    // Key Insights Card
    <div key="insights" className="bg-linear-to-br from-yellow-900/30 via-black to-yellow-900/30 rounded-2xl p-6 border border-yellow-500/30 h-full">
      <h2 className="text-2xl font-cinzel font-bold text-yellow-500 mb-4 flex items-center">
        <Crown className="w-6 h-6 mr-2" />
        Key Insights
      </h2>
      <p className="text-gray-400 text-sm mb-4 italic">🎭 The tea nobody asked for but everyone needs</p>
      <div className="space-y-4 overflow-y-auto max-h-80">
        {analyticsData.insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${
              insight.impact === 'high' 
                ? 'bg-red-500/10 border-red-500/30' 
                : insight.impact === 'medium' 
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-white/5 border-white/20'
            }`}
          >
            <h3 className="text-base font-bold text-white mb-1">{insight.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>,

    // Global Performance Card
    <div key="global" className="bg-linear-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 rounded-2xl p-6 border border-purple-500/30 h-full">
      <h3 className="text-xl font-bold text-purple-400 mb-4">Global Performance</h3>
      <p className="text-gray-400 text-sm mb-4 italic">📊 How badly did we all do?</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center bg-white/5 rounded-xl p-3">
          <p className="text-2xl font-bold text-white mb-1">{analyticsData.totalBallots}</p>
          <p className="text-xs text-gray-300">Players</p>
        </div>
        <div className="text-center bg-white/5 rounded-xl p-3">
          <p className="text-2xl font-bold text-green-400 mb-1">{analyticsData.overallStats.overallAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-gray-300">Accuracy</p>
        </div>
        <div className="text-center bg-white/5 rounded-xl p-3">
          <p className="text-2xl font-bold text-yellow-400 mb-1">{analyticsData.overallStats.powerPickSuccessRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-300">Power Success</p>
        </div>
        <div className="text-center bg-white/5 rounded-xl p-3">
          <p className="text-2xl font-bold text-orange-400 mb-1">{upsets.length}</p>
          <p className="text-xs text-gray-300">Major Upsets</p>
        </div>
      </div>
    </div>,

    // Crowd Favorites Card
    <div key="favorites" className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2" />
        Crowd Favorites Who Won
      </h3>
      <p className="text-gray-400 text-sm mb-4 italic">🎉 The rare times we were actually right</p>
      <div className="space-y-3 overflow-y-auto max-h-80">
        {sortedNominees.filter(([, data]) => data.isWinner).slice(0, 3).map(([nomineeId, data], index) => (
          <div key={nomineeId} className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{data.name}</span>
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-green-400 font-bold text-sm">{data.count}</span>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div 
                className="bg-linear-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(data.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{data.percentage.toFixed(1)}% of all picks</span>
              <span>{data.accuracy.toFixed(1)}% accuracy</span>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Biggest Upsets Card
    <div key="upsets" className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
      <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        Biggest Upsets
      </h3>
      <p className="text-gray-400 text-sm mb-4 italic">💀 When the crowd was spectacularly wrong</p>
      <div className="space-y-3 overflow-y-auto max-h-80">
        {upsets.slice(0, 3).map(([categoryId, data], index) => (
          <div key={categoryId} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{data.categoryName}</p>
                <p className="text-xs text-gray-400">Expected: {data.mostPopularPick?.name}</p>
              </div>
              <div className="text-right ml-2">
                <p className="text-red-400 font-bold text-xs">UPSET</p>
                <p className="text-xs text-gray-400">{data.mostPopularPick?.percentage?.toFixed(1)}% picks</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-300">Winner: <span className="text-white font-medium">{data.winnerNomineeName}</span></p>
              <div className="flex items-center space-x-1 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-bold">SHOCKER</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Power Pick Strategy Card
    <div key="power" className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
      <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        Power Pick Strategy
      </h3>
      <p className="text-gray-400 text-sm mb-4 italic">⚡ Where our confidence went to die (or thrive)</p>
      <div className="space-y-3 overflow-y-auto max-h-80">
        {sortedPowerPicks.slice(0, 5).map(([nomineeId, data]) => (
          <div key={nomineeId} className="bg-linear-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{data.nomineeName}</p>
                <p className="text-xs text-gray-400">{data.category}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ml-2 ${
                data.successRate > 60 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : data.successRate > 30
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {data.successRate.toFixed(0)}% success
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{data.count} power picks</span>
              <span>{data.successRate > 60 ? '🔥 Hot' : data.successRate > 30 ? '🤔 Risky' : '💀 Cold'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ];

  const selectedEvent = SEASON_CIRCUIT.find(e => e.id === eventId);
  const eventTitle = selectedEvent ? selectedEvent.name : getAwardShowName(eventId);
  const eventDate = selectedEvent?.date || '';
  const eventStatus = selectedEvent?.status || 'open';
  const statusLabel = eventStatus === 'completed' ? 'Results' : eventStatus === 'open' ? 'Live' : 'Upcoming';
  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20 border-b border-yellow-500/20">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-cinzel font-bold text-white mb-2">
              {eventStatus === 'completed' ? 'The Results Are In!' : 'Analytics Dashboard'}
            </h1>
            <p className="text-gray-300 mb-4">
              {eventTitle}{eventDate ? ` • ${eventDate}` : ''} • {statusLabel}
            </p>

            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-[11px] text-gray-300 bg-white/10 border border-white/20 rounded-full px-3 py-1">
                Updated {updatedLabel}
              </span>
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="text-[11px] text-yellow-400 border border-yellow-500/30 rounded-full px-3 py-1 hover:bg-yellow-500/10 transition-colors"
              >
                Refresh
              </button>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{analyticsData.totalBallots}</p>
                <p className="text-xs text-gray-300">Players</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{analyticsData.overallStats.overallAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-gray-300">Accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipeable Analytics Cards */}
      <div className="px-4 py-6">
        <SwipeableAnalyticsCards cards={analyticsCards}>
          {analyticsCards}
        </SwipeableAnalyticsCards>
      </div>

      {/* Advanced Analytics Section - Keep these as separate sections */}
      <div className="px-4 py-6 space-y-6">
        <PowerScale leagueId={leagueId} eventId={eventId} />
        <VoterOverlap leagueId={leagueId} eventId={eventId} />
        <AwardsFunnel leagueId={leagueId} eventId={eventId} />
      </div>
    </div>
  );
};

export default MobileAnalytics;
