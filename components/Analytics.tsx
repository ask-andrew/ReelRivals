import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Target, Zap, Trophy, AlertTriangle, Check, Crown, RefreshCw } from 'lucide-react';
import { getAnalyticsData, getAllPlayersWithScores } from '../src/instantService';
import { SEASON_CIRCUIT } from '../constants';
import { dbCore } from '../src/instant';

const Analytics: React.FC<{ leagueId: string; eventId: string }> = ({ leagueId, eventId }) => {
  const [data, setData] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(eventId);

  useEffect(() => {
    setSelectedEventId(eventId);
  }, [eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, scoresRes, categoriesRes] = await Promise.all([
        getAnalyticsData(leagueId, selectedEventId),
        getAllPlayersWithScores(selectedEventId),
        dbCore.queryOnce({ 
          categories: { 
            $: { where: { event_id: selectedEventId } },
            nominees: {}
          },
          ballots: {
            $: { where: { event_id: selectedEventId } },
            picks: {}
          }
        })
      ]);

      setData(analyticsRes.analytics);
      setScores(scoresRes.players);
      
      const cats = categoriesRes.data.categories || [];
      const ballots = categoriesRes.data.ballots || [];
      
      // Map ballots to categories for the grid
      const gridData = cats.map((cat: any) => {
        const userPicks = scoresRes.players.map((player: any) => {
          const userBallot = ballots.find((b: any) => b.user_id === player.id);
          const pick = userBallot?.picks?.find((p: any) => p.category_id === cat.id);
          const winnerId = analyticsRes.analytics?.categoryAnalytics?.[cat.id]?.winnerNomineeId;
          return {
            userId: player.id,
            isCorrect: pick && winnerId && pick.nominee_id === winnerId
          };
        });
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          userPicks
        };
      });

      setCategories(gridData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEventId]);

  if (loading) return <div className="p-12 text-center text-gray-400">Loading Stats...</div>;
  if (!data) return <div className="p-12 text-center text-gray-400">No data available for this event.</div>;

  const upsets = Object.entries(data.categoryAnalytics || {})
    .filter(([, d]: any) => d.upset)
    .sort(([, a]: any, [, b]: any) => b.mostPopularPick?.percentage - a.mostPopularPick?.percentage);

  const hardest = Object.values(data.categoryCorrectness || {})
    .sort((a: any, b: any) => a.percentCorrect - b.percentCorrect)[0] as any;

  const easiest = Object.values(data.categoryCorrectness || {})
    .sort((a: any, b: any) => b.percentCorrect - a.percentCorrect)[0] as any;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <BarChart3 className="mr-2 text-yellow-500" />
            {SEASON_CIRCUIT.find(e => e.id === selectedEventId)?.name} Stats
          </h1>
          <p className="text-sm text-gray-400">Audit & Performance Breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          {SEASON_CIRCUIT.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedEventId(e.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedEventId === e.id ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {e.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Easiest/Hardest */}
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-bold flex items-center">
                <Check className="mr-2 w-4 h-4" /> Easiest Category
              </h3>
              <span className="text-2xl font-bold text-green-400">{easiest?.percentCorrect.toFixed(0)}%</span>
            </div>
            <p className="text-white font-medium">{easiest?.categoryName}</p>
            <p className="text-xs text-green-400/60 mt-1">Highest accuracy across all players</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-400 font-bold flex items-center">
                <AlertTriangle className="mr-2 w-4 h-4" /> Hardest Category
              </h3>
              <span className="text-2xl font-bold text-red-400">{hardest?.percentCorrect.toFixed(0)}%</span>
            </div>
            <p className="text-white font-medium">{hardest?.categoryName}</p>
            <p className="text-xs text-red-400/60 mt-1">Lowest accuracy across all players</p>
          </div>
        </div>

        {/* Popular but Wrong */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 flex flex-col justify-center">
          <h3 className="text-orange-400 font-bold flex items-center mb-4">
            <Users className="mr-2 w-4 h-4" /> Popular But Wrong
          </h3>
          {upsets[0] ? (
            <>
              <div className="mb-2">
                <p className="text-[10px] text-orange-400/60 uppercase tracking-widest font-bold">The Upset</p>
                <p className="text-white font-bold">{(upsets[0][1] as any).categoryName}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 mt-2">
                <p className="text-sm text-gray-400">Most players picked:</p>
                <p className="text-lg font-bold text-red-400">{(upsets[0][1] as any).mostPopularPick?.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">Actual Winner:</span>
                  <span className="text-xs font-bold text-green-400">{(upsets[0][1] as any).winnerNomineeName}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic text-center">No major upsets recorded yet.</p>
          )}
        </div>
      </div>

      {/* Most Picked per Category */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 bg-linear-to-r from-gray-800/50 to-transparent">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Crown className="mr-2 w-5 h-5 text-yellow-500" />
            Consensus Leaderboard
          </h3>
          <p className="text-xs text-gray-400">Most picked nominee per category</p>
        </div>
        <div className="divide-y divide-gray-800">
          {Object.entries(data.categoryAnalytics).map(([id, cat]: any) => (
            <div key={id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{cat.categoryName}</p>
                <p className="text-sm font-medium text-white">{cat.mostPopularPick?.name}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-500">{cat.mostPopularPick?.percentage.toFixed(0)}%</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">of picks</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Grid (Optional Breakdown) */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-end">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center">
              <Zap className="mr-2 w-5 h-5 text-purple-500" />
              Player Breakdown Grid
            </h3>
            <p className="text-xs text-gray-400">Category-by-category hits (✓) and misses (✗)</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase sticky left-0 bg-gray-900/95 z-10 w-48 border-r border-gray-800">Category</th>
                {scores.map(s => (
                  <th key={s.id} className="p-4 text-center min-w-[80px]">
                    <div className="text-lg mb-1">{s.avatar_emoji}</div>
                    <div className="text-[10px] font-bold text-white truncate max-w-[60px] mx-auto">{s.username}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {categories.map(cat => (
                <tr key={cat.categoryId} className="hover:bg-white/5">
                  <td className="p-4 text-xs font-medium text-gray-300 sticky left-0 bg-gray-900/95 z-10 border-r border-gray-800">{cat.categoryName}</td>
                  {cat.userPicks.map((up: any, idx: number) => (
                    <td key={idx} className="p-4 text-center">
                      {up.isCorrect ? (
                        <span className="text-green-500 font-bold">✓</span>
                      ) : (
                        <span className="text-red-500/30">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
