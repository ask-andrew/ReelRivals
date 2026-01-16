import React, { useState, useEffect } from 'react';
import { Zap, X, ChevronRight, AlertTriangle, Trophy, Flame, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PowerPickReminderProps {
  powerPicksLeft: number;
  totalPicksMade: number;
  totalCategories: number;
  onDismiss: () => void;
  onSelectPowerPicks: () => void;
  onContinue: () => void;
  show: boolean;
}

const PowerPickReminder: React.FC<PowerPickReminderProps> = ({
  powerPicksLeft,
  totalPicksMade,
  totalCategories,
  onDismiss,
  onSelectPowerPicks,
  onContinue,
  show
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!show) return null;

  const allPicksMade = totalPicksMade === totalCategories;
  const hasPowerPicksAvailable = powerPicksLeft > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-500">
                  {allPicksMade ? 'Select Your Power Picks!' : 'Don\'t Forget Power Picks!'}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {allPicksMade 
                    ? 'Choose 3 picks to triple your points' 
                    : 'You have power picks available'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Power Pick Explanation */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-white font-medium mb-2">What are Power Picks?</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Choose 3 categories per event as your "Power Picks"</li>
                  <li>• If correct, you get <span className="text-yellow-400 font-bold">3x points</span> instead of normal</li>
                  <li>• Regular pick: 50 points → Power pick: <span className="text-yellow-400 font-bold">150 points</span></li>
                  <li>• Use them on your most confident predictions!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-500">{powerPicksLeft}</div>
              <div className="text-xs text-gray-300">Power Picks Left</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-500">{totalPicksMade}</div>
              <div className="text-xs text-gray-300">Picks Made</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-500">{totalCategories}</div>
              <div className="text-xs text-gray-300">Total Categories</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {hasPowerPicksAvailable && (
              <button
                onClick={onSelectPowerPicks}
                className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <Zap className="w-5 h-5" />
                <span>{allPicksMade ? 'Select Power Picks Now' : 'Choose Power Picks'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onContinue}
              className={`w-full py-3 px-4 rounded-xl transition-all ${
                hasPowerPicksAvailable
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20'
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
              }`}
            >
              {hasPowerPicksAvailable 
                ? (allPicksMade ? 'I\'ll Do This Later' : 'Continue Making Picks')
                : 'All Power Picks Used! 🎉'
              }
            </button>
          </div>

          {/* Warning for continuing without power picks */}
          {hasPowerPicksAvailable && (
            <div className="mt-4 flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">
                {allPicksMade 
                  ? 'You must select 3 power picks before submitting your final ballot!'
                  : 'Don\'t miss out on triple points! You can always come back to this later.'
                }
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PowerPickReminder;
