import React, { useState, useEffect } from 'react';
import { Trophy, Zap, TrendingUp, Users, Award } from 'lucide-react';
import { getAllPlayersWithScores, getRecentWins } from '../src/instantService';

interface LiveScore {
  userId: string;
  username: string;
  avatarEmoji: string;
  totalPoints: number;
  correctPicks: number;
  powerPicksHit: number;
  rank: number;
  previousRank: number;
  trend: 'up' | 'down' | 'same';
}

interface LiveScoringProps {
  eventId: string;
  leagueId: string;
  isLive: boolean;
}

const LiveScoring: React.FC<LiveScoringProps> = ({ eventId, leagueId, isLive }) => {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connected, setConnected] = useState(false);
  const [recentWins, setRecentWins] = useState<any[]>([]);
  const [hasProvisional, setHasProvisional] = useState(false);

  useEffect(() => {
    if (!isLive) return;

    // Initial load
    fetchScores();
    fetchRecentWins();

    // Set up real-time polling (InstantDB doesn't have built-in real-time like Supabase)
    const interval = setInterval(() => {
      fetchScores();
      fetchRecentWins();
    }, 5000); // Poll every 5 seconds

    setConnected(true);

    return () => {
      clearInterval(interval);
    };
  }, [eventId, leagueId, isLive]);

  const fetchScores = async () => {
    try {
      console.log('[LiveScoring] Fetching scores for event:', eventId);
      const result = await getAllPlayersWithScores(eventId);
      console.log('[LiveScoring] Scores result:', result);
      
      if (!result.error) {
        const formattedScores = result.players.map((player, index) => ({
          userId: player.id,
          username: player.username,
          avatarEmoji: player.avatar_emoji,
          totalPoints: player.totalPoints,
          correctPicks: player.correctPicks,
          powerPicksHit: player.powerPicksHit,
          rank: index + 1,
          previousRank: index + 1, // Would need to track previous state
          trend: 'same' as const // Would need to calculate based on previous rank
        }));

        console.log('[LiveScoring] Formatted scores:', formattedScores);
        setScores(formattedScores);
        setLastUpdate(new Date());
      } else {
        console.error('[LiveScoring] Error fetching scores:', result.error);
      }
    } catch (error) {
      console.error('[LiveScoring] Error in fetchScores:', error);
    }
  };

  const fetchRecentWins = async () => {
    try {
      const result = await getRecentWins(eventId, 15);
      if (!result.error) {
        const winsWithDetails = result.wins.map((win: any) => ({
          ...win,
          time: formatTimeAgo(win.announcedAt)
        }));
        setRecentWins(winsWithDetails);
        setHasProvisional(winsWithDetails.some((win: any) => win.isProvisional));
      }
    } catch (error) {
      console.error('Error fetching recent wins:', error);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  if (!isLive) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Live Scoring</h3>
          <p className="text-gray-400 mb-4">The show hasn't started yet</p>
          <p className="text-sm text-gray-500">Check back during the ceremony for real-time updates!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-yellow-500 mb-1">Live Scoring</h2>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              connected ? 'bg-red-500/20 border border-red-500' : 'bg-gray-700 border border-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className={`text-sm font-bold ${connected ? 'text-red-400' : 'text-gray-400'}`}>
                {connected ? 'LIVE' : 'CONNECTING...'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-sm text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-xs text-yellow-400 font-bold">LEADER</span>
          </div>
          <div className="text-xl font-bold text-yellow-500">{scores[0]?.username || 'N/A'}</div>
          <div className="text-sm text-gray-300">{scores[0]?.totalPoints || 0} pts</div>
        </div>
        
        <div className="bg-linear-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-blue-400 font-bold">PLAYERS</span>
          </div>
          <div className="text-xl font-bold text-blue-500">{scores.length}</div>
          <div className="text-sm text-gray-300">Active critics</div>
        </div>
        
        <div className="bg-linear-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-green-500" />
            <span className="text-xs text-green-400 font-bold">WINS</span>
          </div>
          <div className="text-xl font-bold text-green-500">{recentWins.length}</div>
          <div className="text-sm text-gray-300">Announced</div>
        </div>
        
        <div className="bg-linear-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-purple-400 font-bold">POWER PICKS</span>
          </div>
          <div className="text-xl font-bold text-purple-500">
            {scores.reduce((sum, s) => sum + s.powerPicksHit, 0)}
          </div>
          <div className="text-sm text-gray-300">Total hits</div>
        </div>
      </div>

      <div className="space-y-6">
        {hasProvisional && (
          <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-4">
            <div className="text-sm text-yellow-200 font-semibold">Provisional Live Scoring</div>
            <div className="text-xs text-yellow-100/80 mt-1">
              Scores are live from media reports and will be finalized once official results are confirmed.
            </div>
          </div>
        )}
        {/* Live Leaderboard */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">Live Leaderboard</h3>
          <div className="space-y-3">
            {scores.map((score, index) => (
              <div
                key={score.userId}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  index === 0 
                    ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-400 text-black' : 
                    index === 2 ? 'bg-orange-600 text-white' : 
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {score.rank}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-linear-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center text-lg">
                    {score.avatarEmoji}
                  </div>
                  
                  {/* Name & Stats */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{score.username}</span>
                      {getTrendIcon(score.trend)}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                      <span>{score.correctPicks} correct</span>
                      {score.powerPicksHit > 0 && (
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span>{score.powerPicksHit} power</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Points */}
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-500">{score.totalPoints}</div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Wins */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">Recent Wins</h3>
          <div className="space-y-3">
            {recentWins.map((win, index) => (
              <div key={index} className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-green-400 font-bold">
                    {win.categoryName}
                    {win.isProvisional && <span className="ml-2 text-[10px] text-yellow-300">PROVISIONAL</span>}
                  </span>
                  <span className="text-xs text-gray-500">{win.time}</span>
                </div>
                <div className="text-sm text-gray-300 font-medium">🏆 {win.winnerName}</div>
              </div>
            ))}
          </div>
          
          {connected && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400 font-bold">LIVE UPDATES</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveScoring;
