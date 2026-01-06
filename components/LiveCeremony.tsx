
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ChevronUp, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Ballot } from '../types';

interface LiveCeremonyProps {
  ballot: Ballot | null;
}

const LiveCeremony: React.FC<LiveCeremonyProps> = ({ ballot }) => {
  const [announcedWinners, setAnnouncedWinners] = useState<Record<string, string>>({});
  const [nextCategoryIndex, setNextCategoryIndex] = useState(0);

  // Simulate announcement every 15 seconds for demo
  useEffect(() => {
    const timer = setInterval(() => {
      if (nextCategoryIndex < CATEGORIES.length) {
        const cat = CATEGORIES[nextCategoryIndex];
        // Randomly pick a winner from nominees
        const winnerId = cat.nominees[Math.floor(Math.random() * cat.nominees.length)].id;
        setAnnouncedWinners(prev => ({ ...prev, [cat.id]: winnerId }));
        setNextCategoryIndex(prev => prev + 1);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [nextCategoryIndex]);

  const currentCategory = CATEGORIES[nextCategoryIndex] || CATEGORIES[CATEGORIES.length - 1];
  const userPick = ballot?.picks[currentCategory.id];
  const pickedNominee = currentCategory.nominees.find(n => n.id === userPick?.nomineeId);

  return (
    <div className="flex flex-col p-6 space-y-8 h-full">
      <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4 flex items-center justify-between animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-sm font-bold tracking-widest uppercase">Live • Golden Globes 2026</span>
        </div>
        <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white font-black">72°</span>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Currently Awarding</h3>
        <motion.div 
          key={currentCategory.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-yellow-900/40 to-black border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden"
        >
          <Star className="absolute -top-4 -right-4 text-yellow-500/10 w-24 h-24" />
          <h2 className="text-2xl font-cinzel font-bold mb-4">{currentCategory.name}</h2>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Trophy className="text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Your Prediction</p>
              <p className="font-bold text-white">{pickedNominee?.name || 'No pick'}</p>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Potential Points</span>
              <span className="text-lg font-bold text-yellow-500">
                {userPick?.isPowerPick ? currentCategory.powerPoints : currentCategory.basePoints} pts
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Past Results</h3>
        <div className="space-y-3">
          {CATEGORIES.slice(0, nextCategoryIndex).reverse().map((cat) => {
            const winnerId = announcedWinners[cat.id];
            const winner = cat.nominees.find(n => n.id === winnerId);
            const userChoice = ballot?.picks[cat.id];
            const isCorrect = userChoice?.nomineeId === winnerId;

            return (
              <motion.div 
                layout
                key={cat.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {isCorrect ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cat.name}</p>
                    <p className="text-sm font-bold text-white">{winner?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Score</p>
                  <p className={`font-bold ${isCorrect ? 'text-green-500' : 'text-gray-500'}`}>
                    {isCorrect ? `+${userChoice?.isPowerPick ? cat.powerPoints : cat.basePoints}` : '0'}
                  </p>
                </div>
              </motion.div>
            );
          })}
          {nextCategoryIndex === 0 && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-sm">The ceremony hasn't started yet.</p>
              <p className="text-xs mt-2 uppercase tracking-widest">Grab some popcorn! 🍿</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveCeremony;
