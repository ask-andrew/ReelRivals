import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, ChevronRight, ChevronLeft, Info, Loader2 } from 'lucide-react';
import { Pick } from '../types';
import { getCategories, createOrUpdateBallot, type Category } from '../src/ballots';

interface BallotSwiperProps {
  onComplete: (picks: Record<string, Pick>) => void;
  userId: string;
  leagueId: string;
}

const BallotSwiper: React.FC<BallotSwiperProps> = ({ onComplete, userId, leagueId }) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [powerPicksLeft, setPowerPicksLeft] = useState(3);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const category = categories[currentCategoryIndex];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { categories: data, error } = await getCategories('golden-globes-2026');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (nomineeId: string) => {
    setSelectedNomineeId(nomineeId);
  };

  const handleConfirmPick = async (isPower: boolean = false) => {
    if (!selectedNomineeId || !category) return;
    if (isPower && powerPicksLeft <= 0) return;

    const newPicks = {
      ...picks,
      [category.id]: { nomineeId: selectedNomineeId, isPowerPick: isPower }
    };
    
    setPicks(newPicks);
    
    if (isPower) {
      setPowerPicksLeft(powerPicksLeft - 1);
    }

    // Move to next category or complete
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setSelectedNomineeId(null);
    } else {
      // Save all picks to database
      setSaving(true);
      try {
        const picksArray = Object.entries(newPicks).map(([categoryId, pick]) => ({
          categoryId,
          nomineeId: pick.nomineeId,
          isPowerPick: pick.isPowerPick
        }));

        const { ballot, error } = await createOrUpdateBallot(
          userId,
          'golden-globes-2026',
          leagueId,
          picksArray
        );

        if (error) throw error;
        
        onComplete(newPicks);
      } catch (error) {
        console.error('Error saving ballot:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      // Restore previous selection if exists
      const prevCategoryId = categories[currentCategoryIndex - 1]?.id;
      if (prevCategoryId && picks[prevCategoryId]) {
        setSelectedNomineeId(picks[prevCategoryId].nomineeId);
      } else {
        setSelectedNomineeId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="animate-spin text-yellow-500 mb-4" size={32} />
        <p className="text-gray-400">Loading categories...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-gray-400">No categories found</p>
      </div>
    );
  }

  const progress = ((currentCategoryIndex + 1) / categories.length) * 100;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{category.name}</h2>
          <div className="flex items-center space-x-2">
            <Zap className="text-yellow-500" size={16} />
            <span className="text-sm font-bold">{powerPicksLeft} Power Picks</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Category {currentCategoryIndex + 1} of {categories.length}
        </p>
      </div>

      {/* Nominee Cards */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {category.nominees.map((nominee) => (
              <motion.div
                key={nominee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelect(nominee.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedNomineeId === nominee.id
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {nominee.tmdb_id && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${nominee.tmdb_id}`}
                      alt={nominee.name}
                      className="w-16 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{nominee.name}</h3>
                    {category.base_points >= 50 && (
                      <p className="text-sm text-gray-400">{category.base_points} points</p>
                    )}
                  </div>
                  {selectedNomineeId === nominee.id && (
                    <Check className="text-yellow-500" size={24} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/10">
        <div className="flex space-x-4">
          <button
            onClick={handleBack}
            disabled={currentCategoryIndex === 0}
            className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          
          <button
            onClick={() => handleConfirmPick(false)}
            disabled={!selectedNomineeId || saving}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>{currentCategoryIndex === categories.length - 1 ? 'Complete Ballot' : 'Next'}</span>
              </>
            )}
          </button>
          
          {powerPicksLeft > 0 && (
            <button
              onClick={() => handleConfirmPick(true)}
              disabled={!selectedNomineeId || saving}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl transition-all flex items-center space-x-2"
            >
              <Zap size={20} />
              <span>Power Pick</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BallotSwiper;
