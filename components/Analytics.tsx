import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Zap, Award, Filter, RefreshCw, Calendar, TrendingDown, TrendingUp as ArrowTrendingUp, Trophy, Target, Flame, Crown, AlertTriangle, Share2, MessageCircle, Twitter, Link } from 'lucide-react';
import { getAnalyticsData } from '../src/instantService';
import type { Ballot, Category } from '../src/ballots';
import { SEASON_CIRCUIT } from '../constants';
import PowerScale from './PowerScale';
import VoterOverlap from './VoterOverlap';
import AwardsFunnel from './AwardsFunnel';

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

const Analytics: React.FC<{ leagueId: string; eventId: string }> = ({ leagueId, eventId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState(eventId);

  useEffect(() => {
    setSelectedEventId(eventId);
  }, [eventId]);

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

      const { analytics, error: analyticsError } = await getAnalyticsData(leagueId, selectedEventId);

      if (analyticsError) throw analyticsError;

      setAnalyticsData(analytics);

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [leagueId, selectedEventId, excludeTestUsers, refreshKey]);

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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900">
      {/* Award Show Selector - Moved to Top */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-4">
          <div className="max-w-lg mx-auto">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white">Award Show</h2>
                <button 
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw size={14} className="text-white" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {SEASON_CIRCUIT.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`p-2 rounded-lg border transition-all text-center ${
                      selectedEventId === event.id
                        ? event.status === 'completed'
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      <span className="text-sm">{event.icon}</span>
                      {event.status === 'completed' && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1" />
                      )}
                      {event.status === 'open' && (
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse ml-1" />
                      )}
                    </div>
                    <div className="text-[10px] font-bold leading-tight">{event.name.split(' ')[0]}</div>
                    <div className="text-[8px] opacity-70">
                      {event.status === 'completed' ? '✅' : event.status === 'open' ? '📊' : '📅'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  {selectedEventId === eventId ? 'Current Event' : 'Historical Data'}
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="excludeTestUsers"
                    checked={excludeTestUsers}
                    onChange={(e) => setExcludeTestUsers(e.target.checked)}
                    className="w-3 h-3 rounded border-gray-300 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <label htmlFor="excludeTestUsers" className="text-[10px] text-gray-400">
                    Exclude test users
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20 border-b border-yellow-500/20">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-cinzel font-bold text-white mb-3">
              {selectedEventId === 'golden-globes-2026' ? 'The Results Are In!' : 'Analytics Dashboard'}
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              {getAwardShowName(selectedEventId)} - {selectedEventId === eventId ? 'Live Analytics' : 'Historical Results'}
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analyticsData.totalBallots}</p>
                <p className="text-xs text-gray-300">Players</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analyticsData.overallStats.overallAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-gray-300">Accuracy</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{analyticsData.overallStats.powerPickSuccessRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-300">Power Success</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{upsets.length}</p>
                <p className="text-xs text-gray-300">Major Upsets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Header Title */}
      <div className="px-4 pb-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-cinzel font-bold text-white mb-2">
            {getAwardShowName(selectedEventId)} Analytics
          </h2>
          <p className="text-sm text-gray-400">
            {selectedEventId === eventId ? 'Current Event Performance' : 'Historical Results'}
          </p>
        </div>
      </div>

      <div className="px-4 py-8 max-w-lg mx-auto space-y-8">
        
        {/* Share Results */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share Your Results
          </h3>
          <p className="text-gray-400 text-sm mb-4 italic">📤 Let friends see how you did</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  const awardShowName = getAwardShowName(selectedEventId);
                  const awardShowYear = getAwardShowYear(selectedEventId);
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
                  const awardShowName = getAwardShowName(selectedEventId);
                  const awardShowYear = getAwardShowYear(selectedEventId);
                  const text = `🏆 My ${awardShowName} ${awardShowYear} Results!\n🎯 Accuracy: ${analyticsData.overallStats.overallAccuracy.toFixed(1)}%\n⚡ Power Picks: ${analyticsData.overallStats.correctPowerPicks}/${analyticsData.overallStats.totalPowerPicks} correct\n\nThink you can do better? Join Reel Rivals! 🎭`;
                  navigator.clipboard.writeText(text);
                }}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle size={16} />
                <span className="text-sm">iMessage</span>
              </button>
              
              <button 
                onClick={() => {
                  const awardShowName = getAwardShowName(selectedEventId);
                  const awardShowYear = getAwardShowYear(selectedEventId);
                  const text = `🏆 My ${awardShowName} ${awardShowYear} Results!\n🎯 Accuracy: ${analyticsData.overallStats.overallAccuracy.toFixed(1)}%\n⚡ Power Picks: ${analyticsData.overallStats.correctPowerPicks}/${analyticsData.overallStats.totalPowerPicks} correct\n\nThink you can do better? Join Reel Rivals! 🎭`;
                  const url = window.location.href;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                }}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle size={16} />
                <span className="text-sm">WhatsApp</span>
              </button>
              
              <button 
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                }}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Link size={16} />
                <span className="text-sm">Copy Link</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">Challenge friends to beat your score for the next show!</p>
          </div>
        </div>
        
        {/* Key Insights */}
        <div className="bg-linear-to-br from-yellow-900/30 via-black to-yellow-900/30 rounded-2xl p-6 border border-yellow-500/30">
          <h2 className="text-2xl font-cinzel font-bold text-yellow-500 mb-4 flex items-center">
            <Crown className="w-6 h-6 mr-2" />
            Key Insights
          </h2>
          <p className="text-gray-400 text-sm mb-4 italic">🎭 The tea nobody asked for but everyone needs</p>
          <div className="space-y-4">
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
        </div>

        {/* Overall Stats First */}
        <div className="bg-linear-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 rounded-2xl p-6 border border-purple-500/30">
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
        </div>

        {/* Crowd Favorites Who Won */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Crowd Favorites Who Won
          </h3>
          <p className="text-gray-400 text-sm mb-4 italic">🎉 The rare times we were actually right</p>
          <div className="space-y-3">
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
        </div>

        {/* Biggest Upsets */}
        {upsets.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Biggest Upsets
            </h3>
            <p className="text-gray-400 text-sm mb-4 italic">💀 When the crowd was spectacularly wrong</p>
            <div className="space-y-3">
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
          </div>
        )}

        {/* Power Pick Analysis */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Power Pick Strategy
          </h3>
          <p className="text-gray-400 text-sm mb-4 italic">⚡ Where our confidence went to die (or thrive)</p>
          <div className="space-y-3">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-300">{data.count} power picks</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {data.successRate > 60 ? '🔥 Hot' : data.successRate > 30 ? '⚖️ Mixed' : '❌ Cold'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wisdom of the Crowd */}
        {consensusCategories.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Wisdom of the Crowd
            </h3>
            <p className="text-gray-300 text-sm mb-4 italic">🧠 Sometimes the hive mind actually works</p>
            <p className="text-gray-400 text-xs mb-4">Categories where the most popular pick correctly predicted the winner</p>
            <div className="space-y-2">
              {consensusCategories.slice(0, 5).map(([categoryId, data]) => (
                <div key={categoryId} className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <p className="text-white font-medium text-sm mb-1">{data.categoryName}</p>
                  <p className="text-xs text-gray-300">Winner: {data.winnerNomineeName}</p>
                  <div className="flex items-center mt-1 text-xs text-blue-400">
                    <Target className="w-3 h-3 mr-1" />
                    Consensus Correct
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Performance */}
        <div className="bg-linear-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Detailed Performance</h3>
          <p className="text-gray-400 text-sm mb-4 italic">🔍 The nerdy numbers nobody asked for</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white mb-1">{analyticsData.overallStats.totalPicks}</p>
              <p className="text-xs text-gray-300">Total Picks</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-400 mb-1">{analyticsData.overallStats.totalCorrectPicks}</p>
              <p className="text-xs text-gray-300">Correct</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-yellow-400 mb-1">{analyticsData.overallStats.totalPowerPicks}</p>
              <p className="text-xs text-gray-300">Power Picks</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-purple-400 mb-1">{analyticsData.overallStats.correctPowerPicks}</p>
              <p className="text-xs text-gray-300">Power Hits</p>
            </div>
          </div>
        </div>

        {/* Educational Content Section */}
        <div className="space-y-6 py-8 px-6">
          <div className="bg-linear-to-br from-yellow-900/40 via-black to-yellow-900/40 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-cinzel font-bold text-yellow-500 flex items-center">
                <Award className="w-6 h-6 mr-2" />
                The Road to the Oscars
              </h3>
              <div className="text-xs text-gray-400 bg-yellow-500/20 px-3 py-1 rounded-full">
                Understanding Awards Season
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 italic">
              🎓 Master the art of awards prediction with these visual insights into how films are selected and awarded.
            </p>
            
            <div className="space-y-6">
              <PowerScale />
              <VoterOverlap />
              <AwardsFunnel />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
