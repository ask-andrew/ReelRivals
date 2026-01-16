import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronLeft, ChevronRight, Trophy, Star, Check, AlertTriangle, Flame } from 'lucide-react';

interface Pick {
  nomineeId: string;
  isPowerPick: boolean;
}

interface PowerPickSelectorProps {
  picks: Record<string, Pick>;
  categories: any[];
  powerPicksLeft: number;
  onSavePowerPicks: (updatedPicks: Record<string, Pick>) => void;
  onBack: () => void;
  onComplete: () => void;
}

const PowerPickSelector: React.FC<PowerPickSelectorProps> = ({
  picks,
  categories,
  powerPicksLeft,
  onSavePowerPicks,
  onBack,
  onComplete
}) => {
  const [selectedPowerPicks, setSelectedPowerPicks] = useState<Set<string>>(new Set());
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with existing power picks
  React.useEffect(() => {
    const existingPowerPicks = new Set<string>();
    Object.entries(picks).forEach(([categoryId, pick]) => {
      if ((pick as any).isPowerPick) {
        existingPowerPicks.add(categoryId);
      }
    });
    setSelectedPowerPicks(existingPowerPicks);
  }, [picks]);

  const currentCategory = categories[currentCategoryIndex];
  const currentPick = picks[currentCategory.id];
  const isCurrentPowerPick = selectedPowerPicks.has(currentCategory.id);

  const togglePowerPick = (categoryId: string) => {
    const newPowerPicks = new Set(selectedPowerPicks);
    
    if (newPowerPicks.has(categoryId)) {
      newPowerPicks.delete(categoryId);
    } else {
      // Only add if we have power picks available
      if (newPowerPicks.size < 3) {
        newPowerPicks.add(categoryId);
      }
    }
    
    setSelectedPowerPicks(newPowerPicks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Update all picks with power pick status
    const updatedPicks = { ...picks };
    Object.keys(updatedPicks).forEach(categoryId => {
      updatedPicks[categoryId] = {
        ...updatedPicks[categoryId],
        isPowerPick: selectedPowerPicks.has(categoryId)
      };
    });
    
    await onSavePowerPicks(updatedPicks);
    setIsSaving(false);
    onComplete();
  };

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  const canSelectMore = selectedPowerPicks.size < 3;
  const hasSelectedAll = selectedPowerPicks.size === 3;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-yellow-500">Power Picks</h2>
              <p className="text-sm text-gray-300">
                Choose 3 categories for triple points
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              hasSelectedAll 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : canSelectMore
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {selectedPowerPicks.size}/3 Power Picks
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-linear-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(selectedPowerPicks.size / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategoryIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full flex flex-col"
          >
            <div className="flex-1 p-6">
              {/* Category Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{currentCategory.name}</h3>
                  <div className="text-sm text-gray-400">
                    {currentCategoryIndex + 1} of {categories.length}
                  </div>
                </div>
                
                {currentPick && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Your Pick:</p>
                    <p className="text-lg font-medium text-white">{currentPick.nomineeId}</p>
                  </div>
                )}
              </div>

              {/* Power Pick Toggle */}
              <div className="space-y-4">
                <div 
                  onClick={() => togglePowerPick(currentCategory.id)}
                  className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                    isCurrentPowerPick
                      ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                      : canSelectMore
                      ? 'border-white/20 bg-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/5'
                      : 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCurrentPowerPick
                          ? 'bg-yellow-500 text-black'
                          : canSelectMore
                          ? 'bg-white/10 text-gray-400'
                          : 'bg-gray-700 text-gray-500'
                      }`}>
                        {isCurrentPowerPick ? (
                          <Zap className="w-6 h-6" />
                        ) : (
                          <Star className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {isCurrentPowerPick ? 'Power Pick Selected!' : 'Make This a Power Pick'}
                        </h4>
                        <p className="text-sm text-gray-300">
                          {isCurrentPowerPick 
                            ? 'This pick will be worth 3x points if correct!'
                            : canSelectMore
                            ? 'Triple your points if you get this right'
                            : 'No power picks remaining - remove one first'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {isCurrentPowerPick && (
                      <div className="flex items-center space-x-2">
                        <div className="text-yellow-400 font-bold text-lg">3x</div>
                        <Check className="w-6 h-6 text-yellow-400" />
                      </div>
                    )}
                  </div>

                  {/* Points Comparison */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Normal points:</span>
                      <span className="text-white font-medium">{currentCategory.base_points || 50}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Power pick points:</span>
                      <span className={`font-bold ${isCurrentPowerPick ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {(currentCategory.base_points || 50) * 3}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning if trying to select too many */}
                {!canSelectMore && !isCurrentPowerPick && (
                  <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-300">
                      You've already selected 3 power picks. Remove one from another category to select this one.
                    </p>
                  </div>
                )}

                {/* Success message when all selected */}
                {hasSelectedAll && (
                  <div className="flex items-start space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Trophy className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-300">
                      Perfect! You've selected all 3 power picks. Ready to dominate the awards!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentCategoryIndex === 0}
                  className={`p-3 rounded-full transition-all ${
                    currentCategoryIndex === 0
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-sm text-gray-400">
                  Category {currentCategoryIndex + 1} of {categories.length}
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentCategoryIndex === categories.length - 1}
                  className={`p-3 rounded-full transition-all ${
                    currentCategoryIndex === categories.length - 1
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {hasSelectedAll && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Saving Power Picks...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-5 h-5" />
                        <span>Save Power Picks & Continue</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={onBack}
                  className="w-full bg-white/10 hover:bg-white/20 text-gray-300 font-medium py-3 px-4 rounded-xl transition-all"
                >
                  Back to Ballot
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PowerPickSelector;
