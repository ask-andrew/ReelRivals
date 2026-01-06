import React, { useState, useEffect } from 'react';
import { Trophy, Zap, TrendingUp, Users, Award } from 'lucide-react';
import { supabase } from '../src/supabase';

interface LiveScore {
  userId: string;
  username: string;
  avatarEmoji: string;
  totalPoints: number;
  correctPicks: number;
  powerPicksHit: number;
  rank: number;
  previousRank: number;
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

  useEffect(() => {
    if (!isLive) return;

    // Initial load
    fetchScores();

    // Real-time subscription
    const subscription = supabase
      .channel(`live-scores-${eventId}-${leagueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `event_id=eq.${eventId}&league_id=eq.${leagueId}`
        },
        (payload) => {
          console.log('Score update:', payload);
          fetchScores();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'results',
          filter: `category_id=in.(select id from categories where event_id=eq.${eventId})`
        },
        (payload) => {
          console.log('Winner announced:', payload);
          fetchScores();
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, leagueId, isLive]);

  const fetchScores = async () => {
    try {
      const { data: scoresData, error } = await supabase
        .from('scores')
        .select(`
          *,
          user:users(id, username, avatar_emoji)
        `)
        .eq('event_id', eventId)
        .eq('league_id', leagueId)
        .order('total_points', { ascending: false });

      if (error) throw error;

      const formattedScores = scoresData.map((score, index) => ({
        userId: score.user.id,
        username: score.user.username,
        avatarEmoji: score.user.avatar_emoji,
        totalPoints: score.total_points,
        correctPicks: score.correct_picks,
        powerPicksHit: score.power_picks_hit,
        rank: index + 1,
        previousRank: index + 1 // Would need to track previous state
      }));

      setScores(formattedScores);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return 'up';
    if (current > previous) return 'down';
    return 'same';
  };

  const getRankIcon = (change: string) => {
    switch (change) {
      case 'up':
        return <TrendingUp size={14} className="text-green-500" />;
      case 'down':
        return <TrendingUp size={14} className="text-red-500 rotate-180" />;
      default:
        return null;
    }
  };

  if (!isLive) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <Trophy size={24} className="mx-auto text-yellow-500 mb-2" />
        <p className="text-sm text-gray-400">Live scoring will begin during the ceremony</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
            {connected ? 'Live' : 'Connecting...'}
          </span>
        </div>
        {lastUpdate && (
          <span className="text-[10px] text-gray-500">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Top 3 Leaders */}
      <div className="grid grid-cols-3 gap-4">
        {scores.slice(0, 3).map((score, index) => (
          <div
            key={score.userId}
            className={`bg-gradient-to-br rounded-2xl p-4 text-center border ${
              index === 0
                ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
                : index === 1
                ? 'from-gray-400/20 to-gray-500/10 border-gray-400/30'
                : 'from-orange-600/20 to-orange-700/10 border-orange-600/30'
            }`}
          >
            <div className="text-2xl mb-1">{score.avatarEmoji}</div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              <span className="text-lg font-bold">{index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}</span>
              {getRankIcon(getRankChange(score.rank, score.previousRank))}
            </div>
            <p className="text-xs font-bold text-yellow-500 mb-1">{score.username}</p>
            <p className="text-lg font-bold text-white">{score.totalPoints}</p>
            <p className="text-[10px] text-gray-500">{score.correctPicks} correct</p>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-yellow-500" />
            <h3 className="text-sm font-bold text-yellow-500">Full Standings</h3>
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {scores.map((score) => (
            <div key={score.userId} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-500 w-4">{score.rank}</span>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                  {score.avatarEmoji}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{score.username}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                    <span>{score.correctPicks} correct</span>
                    {score.powerPicksHit > 0 && (
                      <span className="flex items-center space-x-1">
                        <Zap size={10} className="text-yellow-500" />
                        <span>{score.powerPicksHit} power hits</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-500">{score.totalPoints}</p>
                <p className="text-[8px] text-gray-500 uppercase font-black">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Results */}
      <div className="flex justify-center">
        <button className="flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-full text-yellow-500 hover:bg-yellow-500/30 transition-colors">
          <Award size={14} />
          <span className="text-xs font-bold uppercase tracking-widest">Share Results</span>
        </button>
      </div>
    </div>
  );
};

export default LiveScoring;
