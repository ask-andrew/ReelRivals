import React from 'react';
import { MOCK_LEAGUE_MEMBERS } from '../constants';

interface StandingsSnippetProps {
  onViewLeague: () => void;
}

const StandingsSnippet: React.FC<StandingsSnippetProps> = ({ onViewLeague }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Season Standings</h3>
        <button onClick={onViewLeague} className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">View League</button>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {MOCK_LEAGUE_MEMBERS.map((member, idx) => (
          <div key={member.id} className={`flex items-center justify-between px-6 py-4 ${idx !== MOCK_LEAGUE_MEMBERS.length - 1 ? 'border-b border-white/5' : ''}`}>
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-gray-500 w-4">{idx + 1}</span>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">{member.avatar}</div>
              <span className="text-sm font-bold">{member.displayName}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-yellow-500 block">{member.totalScore}</span>
              <span className="text-[8px] text-gray-500 uppercase font-black">Season Pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StandingsSnippet;
