import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, ChevronRight, ChevronLeft, Info, Loader2, Users } from 'lucide-react';
import { Pick } from '../types';
import { getCategories, saveBallotPick, getBallot, getNomineePercentages, getResults } from '../src/instantService';
import { SEASON_CIRCUIT } from '../constants';
import PowerPickReminder from './PowerPickReminder';
import PowerPickSelector from './PowerPickSelector';

interface BallotSwiperDBProps {
  onComplete: (picks: Record<string, Pick>) => void;
  userId: string;
  leagueId: string;
  eventId: string;
}

const BallotSwiperDB: React.FC<BallotSwiperDBProps> = ({ onComplete, userId, leagueId, eventId }) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [powerPicksLeft, setPowerPicksLeft] = useState(3);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'review' | 'edit' | 'power-picks'>('edit');
  const [nomineePercentages, setNomineePercentages] = useState<Record<string, number>>({});
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingPercentages, setLoadingPercentages] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [showPowerPickReminder, setShowPowerPickReminder] = useState(false);
  const [showPowerPickSelector, setShowPowerPickSelector] = useState(false);
  const [hasSeenPowerPickReminder, setHasSeenPowerPickReminder] = useState(false);
  
  // Check if the event is completed based on the season circuit
  const event = SEASON_CIRCUIT.find(e => e.id === eventId);
  const isEventCompleted = event?.status === 'completed';

  const category = categories[currentCategoryIndex];


  useEffect(() => {
    loadData();
    // Load results for completed event to show correctness
    if (isEventCompleted) {
      loadResults();
    }
  }, []);

  // Update selected nominee when category changes
  // NOTE: We intentionally exclude 'picks' from dependencies to avoid infinite loops
  // The picks state is managed elsewhere and we only read from it here
  useEffect(() => {
    if (category && picks[category.id]) {
        setSelectedNomineeId(picks[category.id].nomineeId);
    } else {
        setSelectedNomineeId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategoryIndex, category]);

  // Load percentages when category changes
  useEffect(() => {
    if (category && viewMode === 'edit') {
      loadNomineePercentages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, viewMode]);

  const loadNomineePercentages = async () => {
    if (!category) return;
    
    setLoadingPercentages(true);
    try {
      const { percentages, totalUsers: users, error } = await getNomineePercentages(
        category.id, 
        eventId, 
        leagueId
      );
      
      if (error) {
        console.error('Error loading nominee percentages:', error);
      } else {
        setNomineePercentages(percentages);
        setTotalUsers(users);
      }
    } catch (error) {
      console.error('Error loading nominee percentages:', error);
    } finally {
      setLoadingPercentages(false);
    }
  };

  const loadResults = async () => {
    try {
      const { results } = await getResults(eventId);
      
      if (results && results.length > 0) {
        setResults(results);
        setResultsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  // Simple correctness check for visual styling
  const getCategoryCorrectness = (categoryId: string): 'correct' | 'incorrect' | 'no-pick' => {
    if (!resultsLoaded || !picks[categoryId]) return 'no-pick';
    
    const pick = picks[categoryId];
    const result = results.find(r => r.category_id === categoryId);
    if (!result) return 'no-pick';
    
    return result.winner_nominee_id === pick.nomineeId ? 'correct' : 'incorrect';
  };

  const loadData = async () => {
    try {
      const [{ categories: cats, error: catsError }, ballot] = await Promise.all([
        getCategories(eventId),
        getBallot(userId, eventId)
      ]);

      if (catsError) throw catsError;

      setCategories(cats || []);

      // If ballot exists, hydrate picks
      if (ballot && ballot.picks) {
        const loadedPicks: Record<string, Pick> = {};
        let powerPicksUsed = 0;

        ballot.picks.forEach((p: any) => {
          loadedPicks[p.category_id] = {
            nomineeId: p.nominee_id,
            isPowerPick: p.is_power_pick
          };
          if (p.is_power_pick) powerPicksUsed++;
        });

        setPicks(loadedPicks);
        setPowerPicksLeft(Math.max(0, 3 - powerPicksUsed));
        
        // If user has picks, start in review mode
        if (Object.keys(loadedPicks).length > 0) {
          setViewMode('review');
        }
        
        // Golden Globes is completed - force review mode to prevent new picks
        if (isEventCompleted) {
          setViewMode('review');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (nomineeId: string) => {
    // Golden Globes is completed - prevent new selections
    if (isEventCompleted) {
      return;
    }
    setSelectedNomineeId(nomineeId);
  };

  const handleConfirmPick = async (isPower: boolean = false) => {
    if (!selectedNomineeId || !category) return;
    if (isPower && powerPicksLeft <= 0) return;
    
    // Event is completed - prevent new picks
    if (isEventCompleted) {
      const eventName = event?.name || 'This event';
      alert(`${eventName} ceremony has concluded! You can view your selections but cannot make new picks for this event.`);
      return;
    }

    // Store previous state for rollback
    const previousPicks = picks;
    const previousPowerPicks = powerPicksLeft;
    
    setSaving(true);
    try {
        // Optimistic update
        const newPick = { nomineeId: selectedNomineeId, isPowerPick: isPower };
        const newPicks = { ...picks, [category.id]: newPick };
        setPicks(newPicks);
        
        if (isPower) setPowerPicksLeft(prev => prev - 1);

        // Save to DB
        const result = await saveBallotPick(
            userId, 
            eventId, 
            leagueId, 
            category.id, 
            selectedNomineeId, 
            isPower
        );

        if (result.error) {
            throw result.error;
        }

        // Move to next or complete (show review at end)
        if (currentCategoryIndex < categories.length - 1) {
            setCurrentCategoryIndex(currentCategoryIndex + 1);
        } else {
            // NEW: Show review mode when done with all categories
            setViewMode('review');
        }

    } catch (e) {
        console.error("Failed to save pick", e);
        // Rollback optimistic update
        setPicks(previousPicks);
        setPowerPicksLeft(previousPowerPicks);
        alert("Failed to save your pick. Please try again.");
    } finally {
        setSaving(false);
    }
  };

  const handleSkip = () => {
    if (isEventCompleted) return;
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    } else {
      setViewMode('review');
    }
  };

  const handleBack = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  // Jump to specific category for editing (Golden Globes completed - only viewing)
  const handleEditCategory = (categoryIndex: number) => {
    if (isEventCompleted) {
      // Don't allow editing since event is completed, just show the category
      setCurrentCategoryIndex(categoryIndex);
      setViewMode('review');
      return;
    }
    setCurrentCategoryIndex(categoryIndex);
    setViewMode('edit');
  };

  // NEW: Calculate completion stats
  const completedCount = Object.keys(picks).length;
  const totalCategories = categories.length;
  const allComplete = completedCount === totalCategories;

  // Power pick reminder logic
  useEffect(() => {
    // Show reminder when user completes all picks but hasn't used power picks
    if (allComplete && powerPicksLeft > 0 && !hasSeenPowerPickReminder && !isEventCompleted) {
      setTimeout(() => {
        setShowPowerPickReminder(true);
      }, 1000);
    }
  }, [allComplete, powerPicksLeft, hasSeenPowerPickReminder]);

  // Show reminder when user has made some picks and has power picks available
  useEffect(() => {
    if (completedCount >= 3 && powerPicksLeft > 0 && !hasSeenPowerPickReminder && !isEventCompleted) {
      setTimeout(() => {
        setShowPowerPickReminder(true);
      }, 2000);
    }
  }, [completedCount, powerPicksLeft, hasSeenPowerPickReminder]);

  const handlePowerPickReminder = (action: 'dismiss' | 'select' | 'continue') => {
    setShowPowerPickReminder(false);
    setHasSeenPowerPickReminder(true);
    
    if (action === 'select') {
      setShowPowerPickSelector(true);
    }
  };

  const handlePowerPickSelectorSave = async (updatedPicks: Record<string, Pick>) => {
    // Count power picks in updated picks
    const powerPickCount = Object.values(updatedPicks).filter(pick => pick.isPowerPick).length;
    setPowerPicksLeft(Math.max(0, 3 - powerPickCount));
    setPicks(updatedPicks);
    setShowPowerPickSelector(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="animate-spin text-yellow-500 mb-4" size={32} />
        <p className="text-gray-400">Loading categories & picks...</p>
      </div>
    );
  }

  // Check if we have categories loaded
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-gray-400">No categories found</p>
      </div>
    );
  }

  // ===== REVIEW MODE UI ===== 
  if (viewMode === 'review') {
    return (
      <div className="h-full flex flex-col bg-black">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-yellow-500">Your Ballot</h2>
              <p className="text-sm text-gray-400 mt-1">
                {completedCount} of {totalCategories} categories complete
                {isEventCompleted && ' • Event Completed'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!isEventCompleted && powerPicksLeft > 0 && (
                <button
                  onClick={() => setShowPowerPickSelector(true)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-lg text-sm font-bold transition-all flex items-center space-x-1"
                >
                  <Zap size={14} />
                  <span>{powerPicksLeft} Power Picks</span>
                </button>
              )}
              {isEventCompleted && (
                <div className="flex items-center space-x-1 text-green-400">
                  <Check size={16} />
                  <span className="text-sm font-bold">Completed</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCategories) * 100}%` }}
            />
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {categories.map((cat, index) => {
              const pick = picks[cat.id];
              const nominee = pick ? cat.nominees.find((n: any) => n.id === pick.nomineeId) : null;
              const isComplete = !!pick;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    !resultsLoaded ? 'border-white/10 bg-white/5' :
                    getCategoryCorrectness(cat.id) === 'correct' ? 'border-green-500/50 bg-green-500/10' :
                    getCategoryCorrectness(cat.id) === 'incorrect' ? 'border-red-500/50 bg-red-500/10' :
                    'border-white/10 bg-white/5'
                  } hover:border-yellow-500/50 ${
                    isEventCompleted ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                  onClick={() => handleEditCategory(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{cat.emoji}</span>
                        <h3 className="font-bold text-white">{cat.name}</h3>
                        {pick?.isPowerPick && (
                          <Zap className="text-yellow-500" size={16} fill="currentColor" />
                        )}
                      </div>
                      {nominee ? (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-yellow-500 ml-10">
                            {resultsLoaded && getCategoryCorrectness(cat.id) === 'correct' ? '\u2713' : ''} {nominee.name}
                          </p>
                          {resultsLoaded && getCategoryCorrectness(cat.id) === 'correct' && (
                            <span className="text-xs text-green-400 ml-2">CORRECT</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 ml-10">No selection</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isComplete ? (
                        <Check className="text-yellow-500" size={20} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                      )}
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t border-white/10">
          {isEventCompleted ? (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3 text-green-400">
                <Check size={20} />
                <span className="font-bold">Event Completed</span>
              </div>
              <p className="text-sm text-gray-400">
                {event?.name ? `The ${event.name} ceremony has concluded. You can view your selections and check the final standings.` :
                 'This event has concluded. You can view your selections and check the final standings.'}
              </p>
            </div>
          ) : allComplete ? (
            <button
              onClick={() => onComplete(picks)}
              className="w-full bg-linear-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:scale-105"
            >
              <Check size={24} />
              <span>Submit Final Ballot</span>
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">
                Complete all categories to submit your ballot
              </p>
              <button
                onClick={() => {
                  // Find first incomplete category
                  const firstIncomplete = categories.findIndex(c => !picks[c.id]);
                  if (firstIncomplete !== -1) {
                    handleEditCategory(firstIncomplete);
                  }
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all"
              >
                Continue Making Picks
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== EDIT MODE UI (existing code) =====
  // Safety check: ensure current category exists
  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-gray-400">Loading category...</p>
      </div>
    );
  }

  const progress = ((currentCategoryIndex + 1) / categories.length) * 100;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        {/* Prominent Power Picks Section */}
        <div className="bg-linear-to-r from-yellow-900/40 via-orange-900/20 to-yellow-900/40 border-2 border-yellow-500/40 rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-yellow-500/50">
            <Zap size={16} className="text-black" fill="currentColor" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-500 mb-1">⚡ Power Picks Strategy</h3>
              <p className="text-sm text-gray-300">Select your 3 most confident predictions for <span className="text-yellow-500 font-bold">2x points</span></p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-yellow-500 bg-yellow-500/20 rounded-xl px-3 py-1 border-2 border-yellow-500/50">
                {powerPicksLeft}
              </div>
              <p className="text-xs text-gray-400 mt-1">Remaining</p>
            </div>
          </div>
          
          {powerPicksLeft === 3 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mt-3">
              <p className="text-xs text-yellow-400 text-center">
                <strong className="text-yellow-500">Pro Tip:</strong> Use Power Picks on categories you're most confident about. They're worth double points!
              </p>
            </div>
          )}
          
          {powerPicksLeft === 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 mt-3">
              <p className="text-xs text-green-400 text-center">
                <strong className="text-green-500">All Power Picks Used!</strong> You can change them anytime before the event.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{category.name}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('review')}
              className="text-sm text-yellow-500 hover:text-yellow-400 font-semibold underline transition-colors"
            >
              View All Categories ({completedCount}/{totalCategories})
            </button>
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
            {category.nominees && category.nominees.length > 0 && category.nominees.map((nominee: any) => {
              const percentage = nomineePercentages[nominee.id] || 0;
              
              return (
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
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA2NCA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0zMiA0OEMzNi40MTgzIDQ4IDQwIDQ0LjQxODMgNDAgNDBDNDAgMzUuNTgxNyAzNi40MTgzIDMyIDMyIDMyQzI3LjU4MTcgMzIgMjQgMzUuNTgxNyAyNCA0MEMyNCA0NC40MTgzIDI3LjU4MTcgNDggMzIgNDhaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo=';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{nominee.name}</h3>
                      {category.base_points >= 50 && (
                        <p className="text-sm text-gray-400">{category.base_points} points</p>
                      )}
                      
                      {/* User Percentage Display */}
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-blue-500 min-w-12 text-right">
                          {loadingPercentages ? '...' : `${percentage}%`}
                        </span>
                      </div>
                    </div>
                    {selectedNomineeId === nominee.id && (
                      <Check className="text-yellow-500" size={24} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Show message when no nominees */}
          {!category.nominees || category.nominees.length === 0 ? (
            <div className="col-span-2 p-8 text-center">
              <p className="text-gray-400">No nominees available for this category</p>
              <p className="text-sm text-gray-500 mt-2">Please check back later or try refreshing the page</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Actions - Moved higher up */}
      <div className="p-6 border-t border-white/10">
        <div className="flex flex-col space-y-3">
          {/* Show power pick status if pick exists for this category */}
          {picks[category.id] && (
            <div className="flex items-center justify-between p-4 bg-linear-to-r from-yellow-900/20 to-orange-900/20 rounded-xl border-2 border-yellow-500/30">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  picks[category.id].isPowerPick 
                    ? 'bg-yellow-500/20 border-2 border-yellow-500' 
                    : 'bg-white/5 border-2 border-gray-600'
                }`}>
                  <Zap 
                    className={picks[category.id].isPowerPick ? "text-yellow-500" : "text-gray-500"} 
                    size={20} 
                    fill={picks[category.id].isPowerPick ? "currentColor" : "none"}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {picks[category.id].isPowerPick ? "⚡ Power Pick Active" : "Regular Pick"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {picks[category.id].isPowerPick 
                      ? "Worth 2x points" 
                      : powerPicksLeft > 0 ? "Upgrade to power pick" : "No power picks left"}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const currentPick = picks[category.id];
                  const newIsPower = !currentPick.isPowerPick;
                  
                  // Check if we're trying to add a power pick but have none left
                  if (newIsPower && powerPicksLeft <= 0) {
                    alert("No power picks remaining!");
                    return;
                  }
                  
                  setSaving(true);
                  try {
                    
                    // Save the pick with toggled power pick status
                    const result = await saveBallotPick(
                      userId,
                      eventId,
                      leagueId,
                      category.id,
                      currentPick.nomineeId,
                      !currentPick.isPowerPick
                    );
                    
                    if (result.error) {
                      console.error('Toggle error:', result.error);
                      throw result.error;
                    }
                    
                    
                    // Update local state
                    setPicks({
                      ...picks,
                      [category.id]: {
                        ...currentPick,
                        isPowerPick: newIsPower
                      }
                    });
                    
                    // Update power picks count
                    setPowerPicksLeft(prev => newIsPower ? prev - 1 : prev + 1);
                  } catch (e) {
                    console.error("Failed to toggle power pick:", e);
                    alert("Failed to update power pick status. Please try again.");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || (!picks[category.id].isPowerPick && powerPicksLeft <= 0)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  picks[category.id].isPowerPick
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    : 'bg-yellow-600 hover:bg-yellow-500 text-black'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : picks[category.id].isPowerPick ? (
                  "Remove Power"
                ) : (
                  "⚡ Make Power"
                )}
              </button>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleSkip}
              disabled={saving}
              className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 font-bold py-3 rounded-xl transition-all"
            >
              Skip
            </button>

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
            
            {powerPicksLeft > 0 && !picks[category.id] && (
              <button
                onClick={() => handleConfirmPick(true)}
                disabled={!selectedNomineeId || saving}
                className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl transition-all flex items-center space-x-2"
              >
                <Zap size={20} />
                <span>Power Pick</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Power Pick Reminder */}
      <PowerPickReminder
        show={showPowerPickReminder}
        powerPicksLeft={powerPicksLeft}
        totalPicksMade={completedCount}
        totalCategories={totalCategories}
        onDismiss={() => handlePowerPickReminder('dismiss')}
        onSelectPowerPicks={() => handlePowerPickReminder('select')}
        onContinue={() => handlePowerPickReminder('continue')}
      />

      {/* Power Pick Selector */}
      {showPowerPickSelector && (
        <PowerPickSelector
          picks={picks}
          categories={categories}
          powerPicksLeft={powerPicksLeft}
          onSavePowerPicks={handlePowerPickSelectorSave}
          onBack={() => setShowPowerPickSelector(false)}
          onComplete={() => setShowPowerPickSelector(false)}
        />
      )}
    </div>
  );
};

export default BallotSwiperDB;
