import React, { useState, useEffect } from 'react';
import { Trophy, Zap, TrendingUp, Users, Award, Play, Pause, RotateCcw } from 'lucide-react';

// Mock data for demonstration
const mockLiveScores = [
  {
    userId: '1',
    username: 'Andrew',
    avatarEmoji: '🎬',
    totalPoints: 450,
    correctPicks: 8,
    powerPicksHit: 2,
    rank: 1,
    previousRank: 2,
    trend: 'up' as const
  },
  {
    userId: '2',
    username: 'SarahScreens',
    avatarEmoji: '🎭',
    totalPoints: 380,
    correctPicks: 7,
    powerPicksHit: 1,
    rank: 2,
    previousRank: 1,
    trend: 'down' as const
  },
  {
    userId: '3',
    username: 'JakeFromStateFarm',
    avatarEmoji: '🍿',
    totalPoints: 320,
    correctPicks: 6,
    powerPicksHit: 1,
    rank: 3,
    previousRank: 3,
    trend: 'same' as const
  },
  {
    userId: '4',
    username: 'EmilyOscar',
    avatarEmoji: '🏆',
    totalPoints: 280,
    correctPicks: 5,
    powerPicksHit: 0,
    rank: 4,
    previousRank: 5,
    trend: 'up' as const
  },
  {
    userId: '5',
    username: 'FilmBuff92',
    avatarEmoji: '🎪',
    totalPoints: 220,
    correctPicks: 4,
    powerPicksHit: 0,
    rank: 5,
    previousRank: 4,
    trend: 'down' as const
  }
];

const mockRecentWins = [
  { category: 'Best Director', winner: 'Guillermo del Toro - Frankenstein', time: '2 mins ago' },
  { category: 'Best Actress Drama', winner: 'Jessie Buckley - Hamnet', time: '5 mins ago' },
  { category: 'Best Picture Drama', winner: 'Frankenstein', time: '8 mins ago' }
];

const LiveScoringDemo: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [scores, setScores] = useState(mockLiveScores);
  const [recentWins, setRecentWins] = useState(mockRecentWins);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  console.log('LiveScoringDemo rendering, isLive:', isLive);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate score changes
      setScores(prevScores => 
        prevScores.map(score => ({
          ...score,
          totalPoints: score.totalPoints + Math.floor(Math.random() * 10) - 3,
          correctPicks: Math.random() > 0.7 ? score.correctPicks + 1 : score.correctPicks,
        })).sort((a, b) => b.totalPoints - a.totalPoints)
        .map((score, index) => ({
          ...score,
          rank: index + 1,
          trend: index + 1 < score.rank ? 'up' : index + 1 > score.rank ? 'down' : 'same'
        }))
      );
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-yellow-500 mb-2">Golden Globes 2026 - Live Scoring</h1>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                isLive ? 'bg-red-500/20 border border-red-500' : 'bg-gray-700 border border-gray-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className={`text-sm font-bold ${isLive ? 'text-red-400' : 'text-gray-400'}`}>
                  {isLive ? 'LIVE' : 'PAUSED'}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isLive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLive ? <Pause size={16} /> : <Play size={16} />}
              <span>{isLive ? 'Pause' : 'Play'}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all">
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-linear-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
              <span className="text-xs text-yellow-400 font-bold">LEADER</span>
            </div>
            <div className="text-xl font-bold text-yellow-500 truncate">{scores[0]?.username || 'N/A'}</div>
            <div className="text-sm text-gray-300">{scores[0]?.totalPoints || 0} pts</div>
          </div>
          
          <div className="bg-linear-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-xs text-blue-400 font-bold">PLAYERS</span>
            </div>
            <div className="text-xl font-bold text-blue-500">{scores.length}</div>
            <div className="text-sm text-gray-300">Active critics</div>
          </div>
          
          <div className="bg-linear-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-xs text-green-400 font-bold">CATEGORIES</span>
            </div>
            <div className="text-xl font-bold text-green-500">{recentWins.length}/10</div>
            <div className="text-sm text-gray-300">Announced</div>
          </div>
          
          <div className="bg-linear-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-purple-500 shrink-0" />
              <span className="text-xs text-purple-400 font-bold">POWER PICKS</span>
            </div>
            <div className="text-xl font-bold text-purple-500">
              {scores.reduce((sum, s) => sum + s.powerPicksHit, 0)}
            </div>
            <div className="text-sm text-gray-300">Total hits</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Live Leaderboard */}
          <div className="col-span-2">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-yellow-500 mb-4">Live Leaderboard</h2>
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
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Rank */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500 text-black' : 
                        index === 1 ? 'bg-gray-400 text-black' : 
                        index === 2 ? 'bg-orange-600 text-white' : 
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {score.rank}
                      </div>
                      
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-linear-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                        {score.avatarEmoji}
                      </div>
                      
                      {/* Name & Stats */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white truncate">{score.username}</span>
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
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-xl font-bold text-yellow-500">{score.totalPoints}</div>
                      <div className="text-xs text-gray-400">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Wins */}
          <div className="col-span-1">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-yellow-500 mb-4">Recent Wins</h2>
              <div className="space-y-3">
                {recentWins.map((win, index) => (
                  <div key={index} className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <span className="text-xs text-green-400 font-bold">{win.category}</span>
                      <span className="text-xs text-gray-500">{win.time}</span>
                    </div>
                    <div className="text-sm text-gray-300 font-medium">{win.winner}</div>
                  </div>
                ))}
              </div>
              
              {isLive && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-400 font-bold">ANNOUNCEMENT IN PROGRESS</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScoringDemo;
