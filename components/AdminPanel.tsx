import React, { useState, useEffect } from 'react';
import { Trophy, Check, Loader2, Save } from 'lucide-react';
import { getCategories, type Category } from '../src/ballots';
import { supabase } from '../src/supabase';

const AdminPanel: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    }
  };

  const handleSaveWinner = async () => {
    if (!selectedCategory || !selectedWinner) return;

    setSaving(true);
    try {
      // Find the winner nominee ID
      const winnerNominee = selectedCategory.nominees.find(n => n.id === selectedWinner);
      if (!winnerNominee) return;

      // Insert result
      const { error } = await supabase
        .from('results')
        .insert({
          category_id: selectedCategory.id,
          winner_nominee_id: winnerNominee.id
        });

      if (error) throw error;

      // Update category to mark as having a winner
      await supabase
        .from('categories')
        .update({ has_winner: true })
        .eq('id', selectedCategory.id);

      alert('Winner saved successfully!');
      setSelectedWinner('');
    } catch (error) {
      console.error('Error saving winner:', error);
      alert('Error saving winner');
    } finally {
      setSaving(false);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="animate-spin text-yellow-500 mb-4" size={32} />
        <p className="text-gray-400">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-cinzel font-bold text-yellow-500 mb-2">Admin Panel</h1>
          <p className="text-gray-400">Enter Golden Globes 2026 winners as they're announced</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Trophy size={20} className="text-yellow-500 mr-2" />
              Select Category
            </h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedWinner('');
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedCategory?.id === category.id
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Winner Selection */}
          {selectedCategory && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Select Winner</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">{selectedCategory.name}</p>
                <p className="text-xs text-gray-500">Base Points: {selectedCategory.base_points}</p>
              </div>

              <div className="space-y-2">
                {selectedCategory.nominees.map((nominee) => (
                  <label
                    key={nominee.id}
                    className="flex items-center p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/5"
                  >
                    <input
                      type="radio"
                      name="winner"
                      value={nominee.id}
                      checked={selectedWinner === nominee.id}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{nominee.name}</p>
                      {nominee.tmdb_id && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${nominee.tmdb_id}`}
                          alt={nominee.name}
                          className="w-8 h-12 object-cover rounded ml-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleSaveWinner}
                disabled={!selectedWinner || saving}
                className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 mt-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Winner</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
