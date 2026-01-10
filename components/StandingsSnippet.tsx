import React, { useState, useEffect } from 'react';
import { getAllPlayersWithScores } from '../src/instantService';
import { Trophy, Users, Target } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar_emoji: string;
  totalPoints: number;
  hasSubmitted: boolean;
}

interface StandingsSnippetProps {
  onViewLeague: () => void;
  refreshTrigger?: number; // Add this to force refresh
}

const StandingsSnippet: React.FC<StandingsSnippetProps> = ({ onViewLeague, refreshTrigger }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const result = await getAllPlayersWithScores('golden-globes-2026');
        // Show top 3 players who have submitted ballots
        const submittedPlayers = result.players
          .filter(p => p.hasSubmitted)
          .slice(0, 3);
        setPlayers(submittedPlayers);
      } catch (error) {
        console.error('Error loading players:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Season Standings</h3>
          <button onClick={onViewLeague} className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">View Critics</button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex items-center justify-between px-6 py-4 ${i !== 3 ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Season Standings</h3>
        <button onClick={onViewLeague} className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">View Critics</button>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {players.length > 0 ? (
          players.map((player, idx) => (
            <div key={player.id} className={`flex items-center justify-between px-6 py-4 ${idx !== players.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-gray-500 w-4">{idx + 1}</span>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">{player.avatar_emoji}</div>
                <span className="text-sm font-bold">{player.username}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-yellow-500 block">{player.totalPoints}</span>
                <span className="text-[8px] text-gray-500 uppercase font-black">Season Pts</span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No players yet</p>
            <p className="text-xs text-gray-500 mt-1">Be the first to submit your ballot!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandingsSnippet;
