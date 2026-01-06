
import React from 'react';
import { User, Activity } from '../types';

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="space-y-4 px-6 pb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex space-x-3 items-start animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <span className="text-sm">🍿</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-bold text-yellow-500">{activity.userName}</p>
                <span className="text-[8px] text-gray-600 uppercase">2m ago</span>
              </div>
              <p className="text-sm text-gray-300 mt-0.5 leading-snug">{activity.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
