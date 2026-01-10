import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Zap, Award, Filter, RefreshCw, Calendar, TrendingDown, TrendingUp as ArrowTrendingUp } from 'lucide-react';
import { getBallotsByLeague, getCategories } from '../src/ballots';
import type { Ballot, Category } from '../src/ballots';

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
  nomineePopularity: Record<string, { name: string; count: number; percentage: number; powerPickCount: number }>;
  powerPickAnalysis: Record<string, { nomineeName: string; count: number; category: string }>;
  categoryParticipation: Record<string, { categoryName: string; totalPicks: number; uniqueNominees: number }>;
  userActivity: Array<{ username: string; pickCount: number; powerPickCount: number; avatar: string }>;
  trends: TrendData[];
}

const Analytics: React.FC<{ leagueId: string; eventId: string }> = ({ leagueId, eventId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      // Fetch ballots and categories in parallel
      const [{ ballots, error: ballotsError }, { categories: cats, error: categoriesError }] = await Promise.all([
        getBallotsByLeague(leagueId, eventId),
        getCategories(eventId)
      ]);

      if (ballotsError) throw ballotsError;
      if (categoriesError) throw categoriesError;

      setCategories(cats || []);

      // Filter out test users if enabled
      const filteredBallots = excludeTestUsers 
        ? ballots.filter(ballot => !isTestUser(ballot.user_id)) // Note: We'd need to join with users table for usernames
        : ballots;

      // Initialize analytics data structure
      const nomineePopularity: Record<string, { name: string; count: number; percentage: number; powerPickCount: number }> = {};
      const powerPickAnalysis: Record<string, { nomineeName: string; count: number; category: string }> = {};
      const categoryParticipation: Record<string, { categoryName: string; totalPicks: number; uniqueNominees: number }> = {};
      const userActivity: Array<{ username: string; pickCount: number; powerPickCount: number; avatar: string }> = [];

      // Process ballots
      let totalPicks = 0;
      const userPickCounts: Record<string, { pickCount: number; powerPickCount: number }> = {};

      filteredBallots.forEach(ballot => {
        if (!userPickCounts[ballot.user_id]) {
          userPickCounts[ballot.user_id] = { pickCount: 0, powerPickCount: 0 };
        }

        ballot.picks.forEach(pick => {
          totalPicks++;
          userPickCounts[ballot.user_id].pickCount++;
          
          if (pick.is_power_pick) {
            userPickCounts[ballot.user_id].powerPickCount++;
          }

          // Find nominee and category names
          const category = cats?.find(c => c.id === pick.category_id);
          const nominee = category?.nominees?.find(n => n.id === pick.nominee_id);

          if (nominee && category) {
            // Nominee popularity
            if (!nomineePopularity[nominee.id]) {
              nomineePopularity[nominee.id] = { name: nominee.name, count: 0, percentage: 0, powerPickCount: 0 };
            }
            nomineePopularity[nominee.id].count++;
            if (pick.is_power_pick) {
              nomineePopularity[nominee.id].powerPickCount++;
            }

            // Power pick analysis
            if (pick.is_power_pick) {
              if (!powerPickAnalysis[nominee.id]) {
                powerPickAnalysis[nominee.id] = { nomineeName: nominee.name, count: 0, category: category.name };
              }
              powerPickAnalysis[nominee.id].count++;
            }

            // Category participation
            if (!categoryParticipation[category.id]) {
              categoryParticipation[category.id] = { categoryName: category.name, totalPicks: 0, uniqueNominees: new Set().size };
            }
            categoryParticipation[category.id].totalPicks++;
          }
        });
      });

      // Calculate percentages and unique nominees
      Object.keys(nomineePopularity).forEach(nomineeId => {
        nomineePopularity[nomineeId].percentage = totalPicks > 0 
          ? (nomineePopularity[nomineeId].count / totalPicks) * 100 
          : 0;
      });

      // Convert user activity to array (simplified - in real implementation would fetch user details)
      const activityArray = Object.entries(userPickCounts).map(([userId, counts]) => ({
        username: `User_${userId.slice(0, 8)}`, // Simplified username
        pickCount: counts.pickCount,
        powerPickCount: counts.powerPickCount,
        avatar: '👤'
      })).sort((a, b) => b.pickCount - a.pickCount).slice(0, 10);

      // Calculate trends (mock data for now - in real implementation would fetch historical data)
      const trends: TrendData[] = Object.entries(nomineePopularity).slice(0, 10).map(([nomineeId, data]) => {
        // Mock trend calculation - in real implementation, compare with previous events
        const mockPreviousPercentage = Math.random() * 20; // Random previous percentage
        const trendPercentage = data.percentage - mockPreviousPercentage;
        let trend: 'up' | 'down' | 'stable' | 'new';
        
        if (mockPreviousPercentage === 0) {
          trend = 'new';
        } else if (Math.abs(trendPercentage) < 2) {
          trend = 'stable';
        } else if (trendPercentage > 0) {
          trend = 'up';
        } else {
          trend = 'down';
        }

        return {
          nomineeId,
          nomineeName: data.name,
          currentEvent: { count: data.count, percentage: data.percentage },
          previousEvents: [
            {
              eventId: 'oscars-2025',
              eventName: 'Oscars 2025',
              count: Math.floor(mockPreviousPercentage * totalPicks / 100),
              percentage: mockPreviousPercentage
            }
          ],
          trend,
          trendPercentage: Math.abs(trendPercentage)
        };
      });

      setAnalyticsData({
        totalBallots: filteredBallots.length,
        nomineePopularity,
        powerPickAnalysis,
        categoryParticipation,
        userActivity: activityArray,
        trends
      });

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
  const sortedNominees = (Object.entries(analyticsData.nomineePopularity) as [string, { name: string; count: number; percentage: number; powerPickCount: number }][])
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15);

  // Sort power picks
  const sortedPowerPicks = (Object.entries(analyticsData.powerPickAnalysis) as [string, { nomineeName: string; count: number; category: string }][])
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-8 py-8 px-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-cinzel font-bold">Pick Analytics</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-medium">
            Voting Patterns & Insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Test User Filter */}
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <Filter size={16} className="text-gray-400" />
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeTestUsers}
                onChange={(e) => setExcludeTestUsers(e.target.checked)}
                className="rounded text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">Exclude Test Users</span>
            </label>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="flex items-center space-x-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg transition-colors border border-yellow-500/30"
          >
            <RefreshCw size={16} />
            <span className="text-sm font-bold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} className="text-blue-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase">Total Ballots</span>
          </div>
          <p className="text-2xl font-cinzel font-bold">{analyticsData.totalBallots}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {excludeTestUsers ? 'Excluding test accounts' : 'Including all accounts'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 size={20} className="text-green-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase">Total Picks</span>
          </div>
          <p className="text-2xl font-cinzel font-bold">
            {(Object.values(analyticsData.nomineePopularity) as { name: string; count: number; percentage: number; powerPickCount: number }[]).reduce((sum, n) => sum + n.count, 0)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Across all categories</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap size={20} className="text-yellow-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase">Power Picks</span>
          </div>
          <p className="text-2xl font-cinzel font-bold">
            {(Object.values(analyticsData.powerPickAnalysis) as { nomineeName: string; count: number; category: string }[]).reduce((sum, p) => sum + p.count, 0)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Strategic selections</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} className="text-purple-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase">Categories</span>
          </div>
          <p className="text-2xl font-cinzel font-bold">{categories.length}</p>
          <p className="text-[10px] text-gray-400 mt-1">Award categories</p>
        </div>
      </div>

      {/* Most Popular Picks */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Award size={20} className="text-yellow-500" />
          <h3 className="text-lg font-bold text-yellow-500">Most Popular Picks</h3>
        </div>
        
        <div className="space-y-3">
          {sortedNominees.map(([nomineeId, data], index) => (
            <div key={nomineeId} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center text-sm font-bold text-yellow-500">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-white">{data.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{data.count}</span>
                    <span className="text-[10px] text-gray-400">({data.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(data.percentage, 100)}%` }}
                  />
                </div>
                {data.powerPickCount > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Zap size={10} className="text-yellow-500" />
                    <span className="text-[8px] text-yellow-500">
                      {data.powerPickCount} power pick{data.powerPickCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Power Pick Analysis */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Zap size={20} className="text-yellow-500" />
          <h3 className="text-lg font-bold text-yellow-500">Power Pick Strategy</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedPowerPicks.map(([nomineeId, data]) => (
            <div key={nomineeId} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-white">{data.nomineeName}</p>
                  <p className="text-[10px] text-gray-400">{data.category}</p>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-500/20 border border-yellow-500/30 rounded px-2 py-1">
                  <Zap size={12} className="text-yellow-500" />
                  <span className="text-[10px] font-bold text-yellow-500">{data.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Award Show Trends */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar size={20} className="text-yellow-500" />
          <h3 className="text-lg font-bold text-yellow-500">Award Show Trends</h3>
        </div>
        
        <div className="space-y-4">
          {analyticsData.trends.map((trend) => (
            <div key={trend.nomineeId} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-white">{trend.nomineeName}</p>
                    {trend.trend === 'new' && (
                      <span className="bg-green-500/20 text-green-500 text-[8px] px-2 py-1 rounded-full font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-[10px] text-gray-400">
                    <span>Current: {trend.currentEvent.count} picks ({trend.currentEvent.percentage.toFixed(1)}%)</span>
                    {trend.previousEvents.length > 0 && (
                      <span>Previous: {trend.previousEvents[0].eventName} - {trend.previousEvents[0].percentage.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {trend.trend === 'up' && (
                    <div className="flex items-center space-x-1 text-green-500">
                      <ArrowTrendingUp size={16} />
                      <span className="text-sm font-bold">+{trend.trendPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                  {trend.trend === 'down' && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <TrendingDown size={16} />
                      <span className="text-sm font-bold">-{trend.trendPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                  {trend.trend === 'stable' && (
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <span className="text-sm font-bold">±{trend.trendPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mini trend visualization */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1 bg-white/10 rounded-full h-1.5 relative">
                  <div 
                    className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(trend.currentEvent.percentage, 100)}%` }}
                  />
                </div>
                {trend.previousEvents.length > 0 && (
                  <div className="flex-1 bg-white/10 rounded-full h-1.5 relative opacity-60">
                    <div 
                      className="bg-gray-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(trend.previousEvents[0].percentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Users Activity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Users size={20} className="text-yellow-500" />
          <h3 className="text-lg font-bold text-yellow-500">Most Active Users</h3>
        </div>
        
        <div className="space-y-3">
          {analyticsData.userActivity.map((user, index) => (
            <div key={user.username} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center text-sm font-bold text-yellow-500">
                {index + 1}
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg">
                {user.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user.username}</p>
                <div className="flex items-center space-x-4 text-[10px] text-gray-400">
                  <span>{user.pickCount} picks</span>
                  {user.powerPickCount > 0 && (
                    <span className="flex items-center space-x-1 text-yellow-500">
                      <Zap size={10} />
                      <span>{user.powerPickCount} power</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-linear-to-br from-yellow-900/20 via-black to-black border border-yellow-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-yellow-500 mb-4">📊 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-2">Consensus Picks</h4>
            <p className="text-[10px] text-gray-300">
              {sortedNominees[0] && `${sortedNominees[0][1].name} leads with ${sortedNominees[0][1].count} picks (${sortedNominees[0][1].percentage.toFixed(1)}%)`}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-2">Power Strategy</h4>
            <p className="text-[10px] text-gray-300">
              {sortedPowerPicks[0] && `${sortedPowerPicks[0][1].nomineeName} is the top power pick choice`}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-2">Trending Films</h4>
            <p className="text-[10px] text-gray-300">
              {analyticsData.trends.filter(t => t.trend === 'up').length} films gaining momentum, {analyticsData.trends.filter(t => t.trend === 'down').length} losing steam
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-2">Cross-Show Patterns</h4>
            <p className="text-[10px] text-gray-300">
              {analyticsData.trends.filter(t => t.trend === 'stable').length > 0 ? 'Consistent favorites across award shows' : 'Shifting preferences detected'}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-2">Participation</h4>
            <p className="text-[10px] text-gray-300">
              {analyticsData.totalBallots} users have submitted ballots
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-2">Competitive Balance</h4>
            <p className="text-[10px] text-gray-300">
              {sortedNominees.length > 0 && sortedNominees[0][1].percentage > 50 ? 'Strong consensus' : 'Diverse predictions'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
