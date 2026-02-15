import React, { useState, useEffect } from 'react';
import { getAllPlayersWithScoresAcrossSeason, getPlayerStats } from './src/instantService';
import { Users, Share2, Trophy, TrendingUp, Medal, Target, Zap, ArrowUpDown } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar_emoji?: string;
  totalPoints: number;
  eventsParticipated: number;
  goldenGlobesPoints: number;
  baftasPoints: number;
  oscarsPoints: number;
  sagPoints: number;
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

type SortColumn = 'totalPoints' | 'username' | 'goldenGlobesPoints' | 'baftasPoints' | 'oscarsPoints' | 'sagPoints' | 'eventsParticipated';

export const PlayerList: React.FC<PlayerListProps> = ({ refreshTrigger }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>('totalPoints');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'submitted'>('all');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [playersResult, statsResult] = await Promise.all([
        getAllPlayersWithScoresAcrossSeason(),
        getPlayerStats('golden-globes-2026') // Use default for stats
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

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Filter and sort players
  const filteredPlayers = players.filter(player => 
    filterBy === 'all' ? true : player.hasSubmitted
  );

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'totalPoints':
        aValue = a.totalPoints;
        bValue = b.totalPoints;
        break;
      case 'goldenGlobesPoints':
        aValue = a.goldenGlobesPoints;
        bValue = b.goldenGlobesPoints;
        break;
      case 'baftasPoints':
        aValue = a.baftasPoints;
        bValue = b.baftasPoints;
        break;
      case 'oscarsPoints':
        aValue = a.oscarsPoints;
        bValue = b.oscarsPoints;
        break;
      case 'sagPoints':
        aValue = a.sagPoints;
        bValue = b.sagPoints;
        break;
      case 'eventsParticipated':
        aValue = a.eventsParticipated;
        bValue = b.eventsParticipated;
        break;
      case 'username':
      default:
        aValue = a.username;
        bValue = b.username;
        break;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'desc' 
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    } else {
      return sortDirection === 'desc' 
        ? (bValue as number) - (aValue as number)
        : (aValue as number) - (bValue as number);
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

      {/* Players Table */}
      {sortedPlayers.length > 0 ? (
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-800/50 border-b border-gray-700">
            <div className="grid grid-cols-7 gap-2 px-4 py-3 text-xs font-bold text-gray-400">
              <div className="col-span-3">Player</div>
              <button 
                onClick={() => handleSort('goldenGlobesPoints')}
                className="flex items-center space-x-1 hover:text-yellow-400 transition-colors"
              >
                <span>🏆 Globes</span>
                {sortBy === 'goldenGlobesPoints' && <ArrowUpDown size={10} />}
              </button>
              <button 
                onClick={() => handleSort('baftasPoints')}
                className="flex items-center space-x-1 hover:text-yellow-400 transition-colors"
              >
                <span>🎭 BAFTAs</span>
                {sortBy === 'baftasPoints' && <ArrowUpDown size={10} />}
              </button>
              <button 
                onClick={() => handleSort('oscarsPoints')}
                className="flex items-center space-x-1 hover:text-yellow-400 transition-colors"
              >
                <span>✨ Oscars</span>
                {sortBy === 'oscarsPoints' && <ArrowUpDown size={10} />}
              </button>
              <button 
                onClick={() => handleSort('totalPoints')}
                className="flex items-center space-x-1 hover:text-yellow-400 transition-colors"
              >
                <span>Total</span>
                {sortBy === 'totalPoints' && <ArrowUpDown size={10} />}
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="max-h-96 overflow-y-auto">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id}
                className={`grid grid-cols-7 gap-2 px-4 py-3 border-b border-gray-800 hover:bg-gray-800/30 transition-colors ${
                  index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : ''
                }`}
              >
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="shrink-0">
                    {index === 0 && <div className="text-yellow-500 text-lg">🥇</div>}
                    {index === 1 && <div className="text-gray-400 text-lg">🥈</div>}
                    {index === 2 && <div className="text-orange-600 text-lg">🥉</div>}
                    {index > 2 && <div className="text-gray-500 text-sm w-6 text-center">{index + 1}</div>}
                  </div>
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm shrink-0">
                      {player.avatar_emoji || '👤'}
                    </div>
                    <span className="text-sm font-medium text-white truncate">{player.username}</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`text-sm ${player.goldenGlobesPoints > 0 ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                    {player.goldenGlobesPoints > 0 ? player.goldenGlobesPoints : '-'}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`text-sm ${player.baftasPoints > 0 ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>
                    {player.baftasPoints > 0 ? player.baftasPoints : '-'}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`text-sm ${player.oscarsPoints > 0 ? 'text-yellow-400 font-bold' : 'text-gray-500'}`}>
                    {player.oscarsPoints > 0 ? player.oscarsPoints : '-'}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`text-sm font-bold ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                    {player.totalPoints}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-800 rounded-lg bg-gray-900/30">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No players found</p>
        </div>
      )}
    </div>
  );
};