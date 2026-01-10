import React, { useState, useEffect } from 'react';
import { getAllPlayersWithScores, getPlayerStats } from './src/instantService';
import { Users, Share2, Trophy, TrendingUp, Medal, Target, Zap } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar_emoji?: string;
  totalPoints: number;
  correctPicks: number;
  powerPicksHit: number;
  hasSubmitted: boolean;
  updatedAt: number;
}

interface PlayerStats {
  totalUsers: number;
  activePlayers: number;
  completionRate: number;
}

interface PlayerListProps {
  refreshTrigger?: number;
}

export const PlayerList: React.FC<PlayerListProps> = ({ refreshTrigger }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'points' | 'name' | 'correct'>('points');
  const [filterBy, setFilterBy] = useState<'all' | 'submitted'>('all');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventId = 'golden-globes-2026';
      const [playersResult, statsResult] = await Promise.all([
        getAllPlayersWithScores(eventId),
        getPlayerStats(eventId)
      ]);

      if (playersResult.error) {
        throw playersResult.error;
      }

      if (statsResult.error) {
        throw statsResult.error;
      }

      setPlayers(playersResult.players);
      setStats(statsResult);
    } catch (err) {
      console.error('Error loading player data:', err);
      setError('Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareText = `🏆 Check out the Reel Rivals leaderboard! ${stats?.activePlayers || 0} players are competing. I'm ranked #${players.findIndex(p => p.id === 'current-user-id') + 1 || 1} with ${players.find(p => p.id === 'current-user-id')?.totalPoints || 0} points. Think you can beat us?`;
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'Reel Rivals - Lights...Camera...Competition!',
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('Link copied to clipboard! Share it with friends to grow the competition.');
    }
  };

  // Filter and sort players
  const filteredPlayers = players.filter(player => 
    filterBy === 'all' ? true : player.hasSubmitted
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'points') {
      return b.totalPoints - a.totalPoints;
    } else if (sortBy === 'correct') {
      return b.correctPicks - a.correctPicks;
    } else {
      return a.username.localeCompare(b.username);
    }
  });

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 px-4 mb-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-gray-400">Loading players...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 px-4 mb-12">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 px-4 mb-12">
      {/* Header with Stats and Controls */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-cinzel text-yellow-500 mb-2">
          Season Standings
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {stats?.activePlayers === 0 
            ? 'No players yet - be the first!'
            : `${stats.totalUsers} total user${stats.totalUsers === 1 ? '' : 's'} • ${stats.activePlayers} active player${stats.activePlayers === 1 ? '' : 's'}`
          }
        </p>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
              <Users className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-xs text-gray-400">Total Users</div>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.activePlayers}</div>
              <div className="text-xs text-gray-400">Active Players</div>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
              <Target className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.completionRate}%</div>
              <div className="text-xs text-gray-400">Completion Rate</div>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{sortedPlayers.filter(p => p.hasSubmitted).reduce((sum, p) => sum + p.totalPoints, 0)}</div>
              <div className="text-xs text-gray-400">Total Points</div>
            </div>
          </div>
        )}
        
        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setFilterBy(filterBy === 'all' ? 'submitted' : 'all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterBy === 'all' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterBy === 'all' ? 'All Players' : 'Submitted Only'}
            </button>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setSortBy(sortBy === 'points' ? 'name' : 'points')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'points' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sort: {sortBy === 'points' ? 'Points' : 'Name'}
            </button>
          </div>
        </div>
        
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
        >
          <Share2 size={18} />
          <span>Share Leaderboard</span>
        </button>
      </div>

      {/* Players List */}
      {sortedPlayers.length > 0 ? (
        <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-800 rounded-lg p-4 bg-gray-900/30">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={`bg-gray-900/80 border rounded-lg p-4 backdrop-blur-sm transition-all hover:border-yellow-900/50 ${
                player.totalPoints > 0 ? 'border-yellow-500/30' : 'border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-sm font-bold text-gray-400">
                    {index + 1}
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-yellow-700 to-yellow-900 flex items-center justify-center text-xl font-bold text-white">
                    {player.avatar_emoji || '🎬'}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{player.username}</span>
                      {player.totalPoints > 0 && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-500 font-bold">{player.totalPoints} pts</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      {player.hasSubmitted && (
                        <>
                          {player.totalPoints > 0 ? (
                            <>
                              <span>✓ {player.correctPicks} correct</span>
                              {player.powerPicksHit > 0 && (
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-yellow-500" />
                                  <span>{player.powerPicksHit} power hits</span>
                                </span>
                              )}
                            </>
                          ) : (
                            <span>✓ Ballot submitted</span>
                          )}
                        </>
                      )}
                      {!player.hasSubmitted && (
                        <span className="text-gray-500">No ballot submitted</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Points Display */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{player.totalPoints}</div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-white mb-2">No Players Yet</h3>
          <p className="text-gray-400 mb-6">Be the first to submit your ballot and start the competition!</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
          >
            Submit Your Ballot
          </button>
        </div>
      )}
    </div>
  );
};