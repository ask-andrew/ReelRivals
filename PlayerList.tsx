import React from 'react';

// Note: You will need to import your configured db instance here
// import { db } from '../db';

interface Player {
  id: string;
  username: string;
  submittedAt?: string;
}

export const PlayerList: React.FC = () => {
  // TODO: Connect to InstantDB
  // const { isLoading, error, data } = db.useQuery({ players: {} });
  
  // Mock data for display
  const players: Player[] = [
    { id: '1', username: 'Cinephile2025', submittedAt: '2025-01-10' },
    { id: '2', username: 'OscarBuff', submittedAt: '2025-01-11' },
    { id: '3', username: 'DirectorDave', submittedAt: '2025-01-09' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 px-4 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-cinzel text-yellow-500 mb-2">
          Registered Rivals
        </h2>
        <p className="text-gray-400 text-sm">
          Competitors vying for the crown
        </p>
      </div>

      <div className="grid gap-3">
        {players.map((player) => (
          <div 
            key={player.id}
            className="bg-gray-900/80 border border-gray-800 rounded-lg p-4 flex items-center justify-between backdrop-blur-sm hover:border-yellow-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-yellow-700 to-yellow-900 flex items-center justify-center text-xs font-bold text-white">
                {player.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-200">{player.username}</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {player.submittedAt || 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};