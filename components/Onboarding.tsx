
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Avatar } from '../types';
import { signUp, signIn, getCurrentUser, onAuthStateChange, type InstantUser } from '../src/instantAuth';
import { testInstantDB } from '../src/instantAuth';

interface OnboardingProps {
  onComplete: (user: InstantUser) => void;
}

const AVATARS: Avatar[] = ['🎬', '🍿', '🏆', '🎭', '🎥', '✨', '🌟', '📺'];

const AVATAR_COLORS = {
  '🎬': 'from-blue-500 to-cyan-500',
  '🍿': 'from-red-500 to-orange-500', 
  '🏆': 'from-yellow-500 to-amber-500',
  '🎭': 'from-purple-500 to-pink-500',
  '🎥': 'from-green-500 to-emerald-500',
  '✨': 'from-indigo-500 to-purple-500',
  '🌟': 'from-pink-500 to-rose-500',
  '📺': 'from-gray-500 to-slate-500'
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>('🎬');
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Test Instant DB connection on component mount
  useEffect(() => {
    testInstantDB();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { isLogin, email: email.trim(), name: name.trim(), selectedAvatar });
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // Login with Instant DB
        console.log('Attempting Instant DB login...');
        const { user, error } = await signIn(email.trim());
        console.log('Instant DB login result:', { user, error });
        if (error) throw error;
        if (user) onComplete(user);
      } else {
        // Sign up with Instant DB
        if (!name.trim()) {
          setError('Display name is required');
          setLoading(false);
          return;
        }
        
        if (!email.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        
        console.log('Attempting Instant DB signup...');
        const { user, error } = await signUp(
          email.trim(),
          name.trim(),
          selectedAvatar
        );
        console.log('Instant DB signup result:', { user, error });
        
        if (error) throw error;
        if (user) onComplete(user);
      }
    } catch (err: any) {
      console.error('Instant DB auth error:', err);
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Demo mode function for testing UI without backend
  const handleDemoMode = () => {
    const demoUser = {
      id: 'demo-user-id',
      email: email.trim() || 'demo@reelrivals.com',
      username: name.trim() || 'DemoUser',
      avatar_emoji: selectedAvatar,
      created_at: new Date().toISOString()
    };
    console.log('Demo mode activated with user:', demoUser);
    onComplete(demoUser);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-background via-background to-surface"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h1 className="text-6xl font-serif font-bold text-primary mb-3 drop-shadow-lg tracking-tighter">REEL RIVALS</h1>
        <p className="text-text-tertiary font-light tracking-[0.3em] text-xs uppercase">Cinema's Ultimate Prediction League</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex bg-surface/50 backdrop-blur-sm rounded-2xl p-1.5 border border-border/50 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                console.log('Switching to sign up');
                setIsLogin(false);
              }}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all relative overflow-hidden ${
                !isLogin 
                  ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-lg shadow-primary/30 scale-105' 
                  : 'text-text-tertiary hover:text-white hover:bg-white/10'
              }`}
            >
              {!isLogin && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-white/20 rounded-xl"
                />
              )}
              <span className="relative z-10">SIGN UP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Switching to login');
                setIsLogin(true);
              }}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all relative overflow-hidden ${
                isLogin 
                  ? 'bg-gradient-to-r from-primary to-secondary text-background shadow-lg shadow-primary/30 scale-105' 
                  : 'text-text-tertiary hover:text-white hover:bg-white/10'
              }`}
            >
              {isLogin && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-white/20 rounded-xl"
                />
              )}
              <span className="relative z-10">LOG IN</span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-danger/10 border border-danger/30 rounded-xl p-4 text-danger text-sm"
          >
            {error}
          </motion.div>
        )}

        {!isLogin && (
          <>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest text-left">1. Choose Your Persona</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map((avatar) => (
                  <motion.button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-3xl p-4 rounded-2xl transition-all relative overflow-hidden ${
                      selectedAvatar === avatar 
                        ? `bg-gradient-to-br ${AVATAR_COLORS[avatar]} border-2 border-white scale-110 shadow-[0_0_25px_rgba(255,255,255,0.3)] ring-4 ring-white/20` 
                        : 'bg-surface border-2 border-border grayscale hover:grayscale-0 hover:scale-105'
                    }`}
                    whileHover={{ scale: selectedAvatar === avatar ? 1.1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedAvatar === avatar && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-white/20 rounded-2xl"
                      />
                    )}
                    <span className="relative z-10 drop-shadow-lg">{avatar}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest text-left">2. Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. OscarWinner99"
                className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-text placeholder-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest text-left">
            {isLogin ? 'Email Address' : '3. Email Address'}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isLogin ? 'your@email.com' : 'For season alerts & updates'}
            className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-text placeholder-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
            required
          />
          {!isLogin && (
            <p className="text-xs text-text-tertiary text-left italic px-1">We'll notify you when new ballots open for the next show.</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest text-left">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? 'Enter your password' : 'Create a password'}
            className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-text placeholder-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary via-primary to-secondary hover:from-secondary hover:via-primary hover:to-primary disabled:from-gray-600 disabled:to-gray-700 text-background font-black py-6 rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 uppercase tracking-widest text-sm mt-6 flex items-center justify-center space-x-3 relative overflow-hidden group"
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.5)" }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          onClick={(e) => {
            console.log('Submit button clicked');
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          {loading && <Loader2 className="animate-spin z-10" size={20} />}
          <span className="z-10 text-lg">{loading ? 'PROCESSING...' : (isLogin ? '🔓 UNLOCK ACCOUNT' : '🎬 ENTER THE CIRCUIT')}</span>
          {!loading && <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="z-10"
          >
            →
          </motion.div>}
        </motion.button>

        {!loading && (
          <motion.button
            type="button"
            onClick={handleDemoMode}
            className="w-full bg-surface/50 hover:bg-surface text-text-tertiary hover:text-white font-medium py-3 rounded-xl border border-border/50 transition-all mt-3 text-sm"
            whileHover={{ scale: 1.01 }}
          >
            🎮 Try Demo Mode (Skip Login)
          </motion.button>
        )}
      </form>

      <div className="mt-12 flex items-center space-x-2 text-text-tertiary">
        <div className="h-px w-4 bg-border"></div>
        <p className="text-xs uppercase font-bold tracking-widest">{isLogin ? 'Welcome back' : 'Join the prediction circuit'}</p>
        <div className="h-px w-4 bg-border"></div>
      </div>
    </motion.div>
  );
};

export default Onboarding;
