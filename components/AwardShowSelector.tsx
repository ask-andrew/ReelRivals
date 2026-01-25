import React from 'react';
import { AwardEvent } from '../constants';

interface AwardShowSelectorProps {
  awardShows: AwardEvent[];
  selectedAwardShow: string;
  onAwardShowChange: (awardShowId: string) => void;
}

const AwardShowSelector: React.FC<AwardShowSelectorProps> = ({
  awardShows,
  selectedAwardShow,
  onAwardShowChange
}) => {
  const selectedShow = awardShows.find(show => show.id === selectedAwardShow);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 border-green-500 text-green-400';
      case 'completed':
        return 'bg-gray-500/20 border-gray-500 text-gray-400';
      case 'upcoming':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'locked':
        return 'bg-red-500/20 border-red-500 text-red-400';
      default:
        return 'bg-white/10 border-white/20 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open for Picks';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      case 'locked':
        return 'Locked';
      default:
        return status;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Award Show</h2>
        {selectedShow && (
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(selectedShow.status)}`}>
            {getStatusText(selectedShow.status)}
          </div>
        )}
      </div>

      {selectedShow && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedShow.icon}</span>
            <div>
              <h3 className="font-semibold text-white">{selectedShow.name}</h3>
              <p className="text-sm text-gray-400">{selectedShow.date}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Select Award Show:</label>
        <select
          value={selectedAwardShow}
          onChange={(e) => onAwardShowChange(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          {awardShows.map((show) => (
            <option key={show.id} value={show.id} className="bg-black">
              {show.icon} {show.name} ({show.date})
            </option>
          ))}
        </select>
      </div>

      {selectedShow?.status === 'completed' && (
        <div className="mt-4 p-3 bg-gray-500/10 border border-gray-500/30 rounded-lg">
          <p className="text-sm text-gray-300">
            This award show has completed. You can view results but cannot make new picks.
          </p>
        </div>
      )}

      {selectedShow?.status === 'upcoming' && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-300">
            Nominations haven't been announced yet. Check back closer to the ceremony date.
          </p>
        </div>
      )}
    </div>
  );
};

export default AwardShowSelector;
