
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Pick, Category, Nominee } from '../types';
import { getAwardsInsight } from '../geminiService';

interface BallotSwiperProps {
  onComplete: (picks: Record<string, Pick>) => void;
}

const BallotSwiper: React.FC<BallotSwiperProps> = ({ onComplete }) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [powerPicksLeft, setPowerPicksLeft] = useState(3);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [loadingInsightId, setLoadingInsightId] = useState<string | null>(null);

  const category = CATEGORIES[currentCategoryIndex];

  // Load insight for the currently selected nominee if we don't have it
  useEffect(() => {
    if (selectedNomineeId && !insights[selectedNomineeId]) {
      const nominee = category.nominees.find(n => n.id === selectedNomineeId);
      if (nominee) {
        fetchInsight(nominee);
      }
    }
  }, [selectedNomineeId]);

  const fetchInsight = async (nominee: Nominee) => {
    setLoadingInsightId(nominee.id);
    const text = await getAwardsInsight(category.name, nominee.name);
    setInsights(prev => ({ ...prev, [nominee.id]: text }));
    setLoadingInsightId(null);
  };

  const handleSelect = (nomineeId: string) => {
    setSelectedNomineeId(nomineeId);
  };

  const handleConfirmPick = (isPower: boolean = false) => {
    if (!selectedNomineeId) return;
    if (isPower && powerPicksLeft <= 0) return;

    const newPicks = {
      ...picks,
      [category.id]: { nomineeId: selectedNomineeId, isPowerPick: isPower }
    };
    setPicks(newPicks);

    if (isPower) setPowerPicksLeft(prev => prev - 1);

    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      setSelectedNomineeId(null);
    } else {
      onComplete(newPicks);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      const prevPick = picks[CATEGORIES[currentCategoryIndex - 1].id];
      setSelectedNomineeId(prevPick?.nomineeId || null);
    }
  };

  if (!category) return null;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Top Navigation / Progress */}
      <div className="pt-12 px-6 pb-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0}
            className="p-2 -ml-2 text-gray-500 disabled:opacity-0"
          >
            <ChevronLeft />
          </button>
          <div className="text-center">
            <h2 className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-1">
              Category {currentCategoryIndex + 1} of {CATEGORIES.length}
            </h2>
            <h1 className="text-xl font-cinzel font-bold tracking-tight">{category.name}</h1>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
            <Zap size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">{powerPicksLeft}</span>
          </div>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-1.5 justify-center">
          {CATEGORIES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentCategoryIndex ? 'w-8 bg-yellow-500' : idx < currentCategoryIndex ? 'w-2 bg-yellow-900' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {category.nominees.map((nominee) => {
              const isSelected = selectedNomineeId === nominee.id;
              const hasInsight = !!insights[nominee.id];
              const isLoading = loadingInsightId === nominee.id;

              return (
                <button
                  key={nominee.id}
                  onClick={() => handleSelect(nominee.id)}
                  className={`w-full text-left transition-all duration-300 relative rounded-2xl overflow-hidden border ${
                    isSelected 
                      ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)] scale-[1.02]' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="p-5 flex items-start space-x-4">
                    <div className="relative shrink-0">
                      <div className={`w-16 h-16 rounded-xl overflow-hidden border ${isSelected ? 'border-yellow-500/50' : 'border-white/10'}`}>
                        <img 
                          src={`https://picsum.photos/seed/${nominee.id}/200/200`} 
                          alt={nominee.name} 
                          className={`w-full h-full object-cover ${isSelected ? 'opacity-100' : 'opacity-60 grayscale'}`}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full p-1 shadow-lg">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-cinzel font-bold ${isSelected ? 'text-yellow-500' : 'text-white'}`}>
                            {nominee.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{nominee.work}</p>
                        </div>
                        <span className="text-[10px] font-black text-gray-500 bg-white/5 px-2 py-0.5 rounded uppercase">
                          {nominee.odds}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-yellow-500/20"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Info size={12} className="text-yellow-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pundit Insight</span>
                          </div>
                          {isLoading ? (
                            <div className="h-3 w-3/4 bg-yellow-500/10 animate-pulse rounded" />
                          ) : (
                            <p className="text-[11px] italic text-gray-300 leading-relaxed">
                              "{insights[nominee.id] || "Calculating chances..."}"
                            </p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action Bar */}
      <AnimatePresence>
        {selectedNomineeId && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="p-6 bg-black/80 backdrop-blur-xl border-t border-white/10 sticky bottom-0 z-40"
          >
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleConfirmPick(true)}
                disabled={powerPicksLeft <= 0}
                className={`py-4 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                  powerPicksLeft > 0 
                    ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 active:scale-95' 
                    : 'bg-gray-900 text-gray-600 border border-white/5 opacity-50'
                }`}
              >
                <Zap size={16} className={powerPicksLeft > 0 ? 'fill-yellow-500' : ''} />
                <span className="text-xs font-bold uppercase tracking-widest">Power Pick</span>
              </button>
              
              <button
                onClick={() => handleConfirmPick(false)}
                className="py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Lock It In</span>
                <ChevronRight size={16} />
              </button>
            </div>
            {powerPicksLeft > 0 && (
              <p className="text-[10px] text-center text-gray-500 mt-3 uppercase tracking-widest">
                Triple points if this hits! 🔥
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BallotSwiper;
