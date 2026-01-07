import React, { useState, useEffect } from 'react';
import { getActivePlayers, getPlayerStats } from './src/instantService';
import { Users, Share2, Trophy, TrendingUp } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar_emoji?: string;
  submittedAt?: string;
  ballotId?: string;
}

interface PlayerStats {
  totalUsers: number;
  activePlayers: number;
  completionRate: number;
}

export const PlayerList: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventId = 'golden-globes-2026';
      const [playersResult, statsResult] = await Promise.all([
        getActivePlayers(eventId),
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
    const shareText = `🏆 Join me in Reel Rivals! ${stats?.activeUsers || 0} players have already made their picks for the Golden Globes. Think you can beat us?`;
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'Reel Rivals - Movie Awards Fantasy League',
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert('Link copied to clipboard! Share it with friends to grow the competition.');
    }
  };

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
      {/* Header with Stats */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-cinzel text-yellow-500 mb-2">
          Season Standings
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {stats?.activePlayers === 0 
            ? 'Be the first to submit your ballot!'
            : `${stats.activePlayers} player${stats.activePlayers === 1 ? '' : 's'} competing for the crown`
          }
        </p>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
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
              <TrendingUp className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.completionRate}%</div>
              <div className="text-xs text-gray-400">Completion Rate</div>
            </div>
          </div>
        )}
        
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
        >
          <Share2 size={18} />
          <span>Invite Friends & Grow Competition</span>
        </button>
      </div>

      {/* Players List */}
      {players.length > 0 ? (
        <div className="grid gap-3">
          {players.map((player) => (
            <div 
              key={player.id}
              className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 flex items-center justify-between backdrop-blur-sm hover:border-yellow-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-700 to-yellow-900 flex items-center justify-center text-lg font-bold text-white">
                  {player.avatar_emoji || '🎬'}
                </div>
                <div>
                  <span className="font-medium text-gray-200">{player.username}</span>
                  <div className="text-xs text-gray-500">Ballot submitted</div>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {player.submittedAt || 'Pending'}
              </span>
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