import React, { useState, useEffect } from 'react';
import { Trophy, Zap, TrendingUp, Users, Award, AlertTriangle, Sparkles, Flame, Crown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  pointChange?: number;
}

interface RecentWin {
  categoryId: string;
  nomineeId: string;
  categoryName: string;
  winnerName: string;
  time: string;
  isUpset?: boolean;
  powerPickHits?: number;
}

interface EnhancedLiveScoringProps {
  eventId: string;
  leagueId: string;
  isLive: boolean;
}

const EnhancedLiveScoring: React.FC<EnhancedLiveScoringProps> = ({ eventId, leagueId, isLive }) => {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [previousScores, setPreviousScores] = useState<LiveScore[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connected, setConnected] = useState(false);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastWinner, setLastWinner] = useState<RecentWin | null>(null);

  useEffect(() => {
    if (!isLive) return;

    // Initial load
    fetchScores();
    fetchRecentWins();

    // Set up real-time polling
    const interval = setInterval(() => {
      fetchScores();
      fetchRecentWins();
    }, 3000); // Poll every 3 seconds for more responsive updates

    setConnected(true);

    return () => {
      clearInterval(interval);
    };
  }, [eventId, leagueId, isLive]);

  const fetchScores = async () => {
    try {
      const result = await getAllPlayersWithScores(eventId);
      
      if (!result.error) {
        const newScores = result.players.map((player, index) => {
          const previousScore = previousScores.find(s => s.userId === player.id);
          const pointChange = previousScore ? player.totalPoints - previousScore.totalPoints : 0;
          
          return {
            userId: player.id,
            username: player.username,
            avatarEmoji: player.avatar_emoji,
            totalPoints: player.totalPoints,
            correctPicks: player.correctPicks,
            powerPicksHit: player.powerPicksHit,
            rank: index + 1,
            previousRank: previousScore?.rank || index + 1,
            trend: getTrend(previousScore?.rank || index + 1, index + 1),
            pointChange
          };
        });

        // Check for dramatic changes
        const dramaticChange = newScores.find(s => Math.abs(s.pointChange || 0) >= 150); // Power pick hit
        if (dramaticChange && previousScores.length > 0) {
          triggerCelebration(dramaticChange);
        }

        setPreviousScores(scores);
        setScores(newScores);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error in fetchScores:', error);
    }
  };

  const fetchRecentWins = async () => {
    try {
      const result = await getRecentWins(eventId, 15);
      if (!result.error) {
        const winsWithDetails = await Promise.all(
          result.wins.map(async (win: any) => {
            const upsetCheck = await checkIfUpset(win.categoryId, win.nomineeId);
            return {
              categoryId: win.categoryId,
              nomineeId: win.nomineeId,
              categoryName: win.categoryName,
              winnerName: win.winnerName,
              time: formatTimeAgo(win.announcedAt),
              isUpset: upsetCheck.isUpset,
              powerPickHits: upsetCheck.powerPickHits
            };
          })
        );

        // Check for new winner
        if (winsWithDetails.length > 0 && recentWins.length > 0) {
          const latestWin = winsWithDetails[0];
          const previousLatestWin = recentWins[0];
          
          if (latestWin.categoryId !== previousLatestWin?.categoryId) {
            setLastWinner(latestWin);
            if (latestWin.isUpset) {
              triggerUpsetAlert(latestWin);
            }
          }
        }

        setRecentWins(winsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching recent wins:', error);
    }
  };

  const checkIfUpset = async (categoryId: string, winnerNomineeId: string) => {
    try {
      // Get all picks for this category
      const picksQuery = await db.queryOnce({
        picks: {
          $: {
            where: { category_id: categoryId }
          }
        }
      } as any);

      if (picksQuery.data?.picks) {
        const pickCounts = picksQuery.data.picks.reduce((acc: any, pick: any) => {
          acc[pick.nominee_id] = (acc[pick.nominee_id] || 0) + 1;
          return acc;
        }, {});

        const totalPicks = picksQuery.data.picks.length;
        const winnerPicks = pickCounts[winnerNomineeId] || 0;
        const winnerPercentage = (winnerPicks / totalPicks) * 100;

        // Count power picks for winner
        const powerPickHits = picksQuery.data.picks.filter((pick: any) => 
          pick.nominee_id === winnerNomineeId && pick.is_power_pick
        ).length;

        return {
          isUpset: winnerPercentage < 30, // Less than 30% picked the winner
          powerPickHits
        };
      }
    } catch (error) {
      console.error('Error checking upset:', error);
    }
    return { isUpset: false, powerPickHits: 0 };
  };

  const triggerCelebration = (player: LiveScore) => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const triggerUpsetAlert = (win: RecentWin) => {
    // Could add sound effect or special animation
    console.log('UPSET ALERT:', win);
  };

  const getTrend = (previousRank: number, currentRank: number): 'up' | 'down' | 'same' => {
    if (currentRank < previousRank) return 'up';
    if (currentRank > previousRank) return 'down';
    return 'same';
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
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
          <div className="relative">
            <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <div className="absolute -top-1 -right-1">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">BAFTA Live Scoring</h3>
          <p className="text-gray-400 mb-4">The ceremony hasn't started yet</p>
          <p className="text-sm text-gray-500">Check back on Feb 22, 2026 for real-time updates!</p>
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400 font-medium">🎭 BAFTA Awards • Feb 22, 2026</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-linear-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-3">
                <Flame className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg">POWER PICK HIT!</p>
                  <p className="text-sm">+150 points</p>
                </div>
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-yellow-500 mb-1 flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            BAFTA Live
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
              connected ? 'bg-red-500/20 border border-red-500' : 'bg-gray-700 border border-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className={`text-xs font-bold ${connected ? 'text-red-400' : 'text-gray-400'}`}>
                {connected ? 'LIVE' : 'CONNECTING...'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Winner Alert */}
      <AnimatePresence>
        {lastWinner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 rounded-xl border ${
              lastWinner.isUpset 
                ? 'bg-red-500/20 border-red-500/50' 
                : 'bg-green-500/20 border-green-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {lastWinner.isUpset ? (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : (
                  <Trophy className="w-4 h-4 text-green-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {lastWinner.categoryName}
                  </p>
                  <p className="text-xs text-gray-300">
                    Winner: {lastWinner.winnerName}
                    {lastWinner.isUpset && ' • UPSET!'}
                  </p>
                </div>
              </div>
              {lastWinner.powerPickHits > 0 && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">{lastWinner.powerPickHits}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-linear-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-400 font-bold">LEADER</span>
          </div>
          <div className="text-lg font-bold text-yellow-500 truncate">{scores[0]?.username || 'N/A'}</div>
          <div className="text-xs text-gray-300">{scores[0]?.totalPoints || 0} pts</div>
        </div>
        
        <div className="bg-linear-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-purple-400 font-bold">POWER HITS</span>
          </div>
          <div className="text-lg font-bold text-purple-500">
            {scores.reduce((sum, s) => sum + s.powerPicksHit, 0)}
          </div>
          <div className="text-xs text-gray-300">Total</div>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Live Rankings
        </h3>
        <div className="space-y-2">
          {scores.slice(0, 5).map((score, index) => (
            <motion.div
              key={score.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                index === 0 
                  ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Rank */}
                <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                  index === 0 ? 'bg-yellow-500 text-black' : 
                  index === 1 ? 'bg-gray-400 text-black' : 
                  index === 2 ? 'bg-orange-600 text-white' : 
                  'bg-gray-600 text-gray-300'
                }`}>
                  {index + 1}
                </div>
                
                {/* Avatar and Name */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                    {score.avatarEmoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{score.username}</p>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(score.trend)}
                      {score.pointChange && score.pointChange > 0 && (
                        <span className="text-xs text-green-400">+{score.pointChange}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Score */}
              <div className="text-right">
                <div className="text-lg font-bold text-white">{score.totalPoints}</div>
                <div className="text-xs text-gray-400">
                  {score.correctPicks} correct • {score.powerPicksHit} power
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Wins */}
      {recentWins.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-lg font-bold text-blue-500 mb-3">Recent Winners</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentWins.slice(0, 3).map((win, index) => (
              <div key={`${win.categoryId}-${index}`} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-white font-medium">{win.categoryName}</p>
                  <p className="text-xs text-gray-400">{win.winnerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{win.time}</p>
                  {win.isUpset && (
                    <p className="text-xs text-red-400 font-bold">UPSET</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLiveScoring;
