import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Zap, Award } from 'lucide-react';
import { dbCore } from '../src/instant';

interface BallotResultsProps {
  userId: string;
  eventId: string;
}

const BallotResults: React.FC<BallotResultsProps> = ({ userId, eventId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Query for categories, nominees, ballot picks, and results
        const query = await dbCore.queryOnce({
          categories: {
            $: { where: { event_id: eventId } },
            nominees: {},
          },
          ballots: {
            $: { where: { user_id: userId, event_id: eventId } },
            picks: {}
          },
          results: {
            $: { where: { event_id: eventId } }
          }
        });

        const categories = query.data.categories || [];
        const ballot = query.data.ballots?.[0];
        const picks = ballot?.picks || [];
        const results = query.data.results || [];

        // Build lookup maps
        const resultsMap = new Map(results.map((r: any) => [r.category_id, r.winner_nominee_id]));
        const picksMap = new Map(picks.map((p: any) => [p.category_id, p]));

        const breakdown = categories.map((cat: any) => {
          const userPick = picksMap.get(cat.id);
          const winnerId = resultsMap.get(cat.id);
          const nominee = cat.nominees.find((n: any) => n.id === userPick?.nominee_id);
          const winnerNominee = cat.nominees.find((n: any) => n.id === winnerId);
          
          const isCorrect = userPick && winnerId && userPick.nominee_id === winnerId;
          const isPowerPick = userPick?.is_power_pick;
          
          let points = 0;
          if (isCorrect) {
            points = isPowerPick ? cat.base_points * 3 : cat.base_points;
          }

          return {
            categoryName: cat.name,
            pickName: nominee?.name || 'No Pick',
            winnerName: winnerNominee?.name || 'TBD',
            isCorrect,
            isPowerPick,
            points,
            basePoints: cat.base_points
          };
        });

        setData(breakdown);
      } catch (err) {
        console.error('Error fetching ballot breakdown:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, eventId]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading breakdown...</div>;
  if (!data || data.length === 0) return <div className="p-8 text-center text-gray-400">No ballot found for this event.</div>;

  const totalPoints = data.reduce((sum: number, row: any) => sum + row.points, 0);
  const totalCorrect = data.filter((row: any) => row.isCorrect).length;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden max-w-2xl mx-auto my-8">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-linear-to-r from-yellow-900/20 to-black">
        <div>
          <h2 className="text-xl font-bold text-yellow-500">Your Ballot Results</h2>
          <p className="text-sm text-gray-400">Oscar 2026 Prediction Breakdown</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{totalPoints} pts</div>
          <div className="text-xs text-gray-400">{totalCorrect} / {data.length} correct</div>
        </div>
      </div>

      <div className="divide-y divide-gray-800">
        {data.map((row: any, idx: number) => (
          <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{row.categoryName}</p>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${row.isCorrect ? 'text-green-400' : row.pickName === 'No Pick' ? 'text-gray-600' : 'text-red-400'}`}>
                  {row.pickName}
                </span>
                {row.isPowerPick && (
                  <span className="flex items-center text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-bold">
                    <Zap size={10} className="mr-0.5 fill-current" /> POWER
                  </span>
                )}
              </div>
              {!row.isCorrect && row.winnerName !== 'TBD' && (
                <p className="text-xs text-gray-500 mt-1">Winner: {row.winnerName}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-sm font-bold ${row.points > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                  {row.points > 0 ? `+${row.points}` : '0'}
                </div>
                <div className="text-[10px] text-gray-500">pts</div>
              </div>
              {row.winnerName !== 'TBD' ? (
                row.isCorrect ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500/50" />
                )
              ) : (
                <Award size={20} className="text-gray-700" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BallotResults;
