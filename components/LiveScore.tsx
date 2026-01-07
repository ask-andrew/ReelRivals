import React, { useEffect, useState } from 'react';
import { dbCore } from '../src/instant';
import { Trophy, TrendingUp, Users, Clock } from 'lucide-react';

interface LiveScoreProps {
  eventId: string;
  leagueId: string;
}

interface Winner {
  id: string;
  categoryName: string;
  winnerName: string;
  announcedAt: number;
}

interface ScoreUpdate {
  userId: string;
  username: string;
  totalPoints: number;
  correctPicks: number;
  powerPicksHit: number;
  updated_at: number;
}

export default function LiveScore({ eventId, leagueId }: LiveScoreProps) {
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [scoreUpdates, setScoreUpdates] = useState<ScoreUpdate[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Poll for updates every 30 seconds
    const interval = setInterval(async () => {
      await fetchUpdates();
    }, 30000);

    // Initial fetch
    fetchUpdates();

    return () => clearInterval(interval);
  }, [eventId, leagueId]);

  const fetchUpdates = async () => {
    try {
      // Fetch recent results
      const resultsData = await dbCore.query({
        results: {
          $: {
            where: {},
            order: {
              announced_at: 'desc'
            }
          },
          category: {
            name: true,
            event_id: true
          },
          nominee: {
            name: true
          }
        }
      });

      const newResults = resultsData.results || [];
      
      // Filter for current event and recent winners (last hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const recentResults = newResults
        .filter((result: any) => 
          result.category?.event_id === eventId && 
          result.announced_at > oneHourAgo
        )
        .map((result: any) => ({
          id: result.id,
          categoryName: result.category?.name || 'Unknown Category',
          winnerName: result.nominee?.name || 'Unknown Winner',
          announcedAt: result.announced_at
        }));

      setRecentWinners(recentResults);
      
      if (recentResults.length > 0) {
        setIsLive(true);
        setLastUpdate(new Date());
      }

      // Fetch recent score updates
      const scoresData = await dbCore.query({
        scores: {
          $: {
            where: {
              event_id: eventId,
              league_id: leagueId
            },
            order: {
              updated_at: 'desc'
            }
          },
          user: {
            username: true
          }
        }
      });

      const newScores = scoresData.scores || [];
      
      // Get recent score updates (last 30 minutes)
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      const recentScores = newScores
        .filter((score: any) => score.updated_at > thirtyMinutesAgo)
        .map((score: any) => ({
          userId: score.user_id,
          username: score.user?.username || 'Unknown User',
          totalPoints: score.total_points,
          correctPicks: score.correct_picks,
          powerPicksHit: score.power_picks_hit,
          updated_at: score.updated_at
        }));

      setScoreUpdates(recentScores);

    } catch (error) {
      console.error('Error fetching live updates:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLive && recentWinners.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700">Live Scoring Standby</h3>
        <p className="text-gray-500 text-sm mt-2">
          Waiting for award ceremony to begin...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Status */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-bold text-red-700">🔴 LIVE SCORING</h3>
          </div>
          {lastUpdate && (
            <div className="text-sm text-red-600">
              Last update: {formatTime(lastUpdate.getTime())}
            </div>
          )}
        </div>
      </div>

      {/* Recent Winners */}
      {recentWinners.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h4 className="font-semibold flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Recent Winners</span>
            </h4>
          </div>
          <div className="divide-y">
            {recentWinners.slice(0, 5).map((winner) => (
              <div key={winner.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{winner.categoryName}</p>
                    <p className="text-sm text-gray-600 mt-1">🏆 {winner.winnerName}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(winner.announcedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Updates */}
      {scoreUpdates.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h4 className="font-semibold flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Score Updates</span>
            </h4>
          </div>
          <div className="divide-y">
            {scoreUpdates.slice(0, 5).map((update, index) => (
              <div key={`${update.userId}-${index}`} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{update.username}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{update.totalPoints} pts</span>
                      <span>{update.correctPicks} correct</span>
                      {update.powerPicksHit > 0 && (
                        <span className="text-purple-600 font-medium">
                          {update.powerPicksHit} power picks
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(update.updated_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{recentWinners.length}</div>
          <div className="text-sm text-blue-700">Winners Announced</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{scoreUpdates.length}</div>
          <div className="text-sm text-green-700">Score Updates</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-1" />
          <div className="text-sm text-purple-700">Live Tracking</div>
        </div>
      </div>
    </div>
  );
}
