
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Avatar } from '../types';
import { signUp, signIn, type InstantUser } from '../src/instantService';

interface OnboardingProps {
  onComplete: (user: InstantUser) => void;
}

const AVATARS: Avatar[] = ['🎬', '🍿', '🏆', '🎭', '🎥', '✨', '🌟', '📺'];

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
    // testInstantDB(); // Optional now
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { user, error } = await signIn(email.trim(), password.trim());
        if (error) throw error;
        if (user) onComplete(user);
      } else {
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
        
        if (!password.trim()) {
          setError('Password is required');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        const { user, error } = await signUp(
          email.trim(),
          name.trim(),
          selectedAvatar,
          password.trim()
        );
        
        if (error) throw error;
        if (user) onComplete(user);
      }
    } catch (err: any) {
      console.error('Instant DB auth error:', err);
      let errorMessage = 'Authentication failed. Please try again.';
      if (err.message) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    const demoUser = {
      id: 'demo-user-id',
      email: email.trim() || 'demo@reelrivals.com',
      username: name.trim() || 'DemoUser',
      avatar_emoji: selectedAvatar,
      created_at: Date.now()
    } as unknown as InstantUser;
    onComplete(demoUser);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[url('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80')] bg-cover bg-center relative"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 relative z-10"
      >
        <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-linear-to-r from-[#D4AF37] via-[#FFD700] to-[#B8860B] mb-3 drop-shadow-lg tracking-tighter">REEL RIVALS</h1>
        <p className="text-gray-400 font-light tracking-[0.3em] text-xs uppercase animate-pulse mb-4">Predict Award Winners • Compete with Friends • Become the Ultimate Film Critic</p>
      </motion.div>

      {/* Educational Content */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8 relative z-10 max-w-2xl mx-auto"
      >
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 text-center">Why Every Trophy Matters Differently</h2>
          <p className="text-gray-300 text-xs md:text-sm mb-3 md:mb-4 text-center leading-relaxed">
            Not all wins are equal. Master predictions by knowing who's behind the ballot.
          </p>
          
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl md:text-2xl">🏆</span>
                <h3 className="text-yellow-400 font-bold text-xs md:text-sm">Industry Insiders</h3>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                <strong className="text-white">Oscars & BAFTA:</strong> Craftspeople who value technical perfection.
              </p>
              <div className="text-yellow-400 text-xs font-bold mt-2">10K & 8K voters</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl md:text-2xl">🎭</span>
                <h3 className="text-blue-400 font-bold text-xs md:text-sm">Union Giant</h3>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                <strong className="text-white">SAG:</strong> 160K voters = "popular vote" with emotional weight.
              </p>
              <div className="text-blue-400 text-xs font-bold mt-2">160,000 voters</div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl md:text-2xl">🌟</span>
                <h3 className="text-red-400 font-bold text-xs md:text-sm">Global Tastemakers</h3>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                <strong className="text-white">Globes:</strong> 300 journalists set the narrative.
              </p>
              <div className="text-red-400 text-xs font-bold mt-2">300 journalists</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
            <p className="text-gray-400 text-xs text-center leading-relaxed">
              <span className="text-yellow-500 font-bold">Pro Tip:</span> SAG wins often predict Oscar acting winners, while Globes set early momentum.
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 max-w-sm relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all relative overflow-hidden ${
                !isLogin 
                  ? 'bg-linear-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg shadow-gold-500/20 scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="relative z-10">SIGN UP</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all relative overflow-hidden ${
                isLogin 
                  ? 'bg-linear-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="relative z-10">SIGN IN</span>
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}

        {!isLogin && (
          <>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest text-left">1. Choose Your Persona</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map((avatar) => (
                  <motion.button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-3xl p-4 rounded-2xl transition-all relative overflow-hidden ${
                      selectedAvatar === avatar 
                        ? 'bg-linear-to-br from-[#D4AF37] to-[#B8860B] border-2 border-white/20 scale-110 shadow-lg text-black' 
                        : 'bg-white/5 border-2 border-transparent grayscale hover:grayscale-0 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10 drop-shadow-md">{avatar}</span>
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
                placeholder="What should other critics call you?"
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
              <label className="block text-xs font-bold text-text-tertiary uppercase tracking-widest text-left">
                {isLogin ? 'Password' : '4. Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Enter your password' : 'Create a secure password (min 6 chars)'}
                className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-text placeholder-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
              {!isLogin && (
                <p className="text-xs text-text-tertiary text-left italic px-1">Keep your account safe with a strong password.</p>
              )}
            </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 disabled:from-gray-600 disabled:to-gray-700 text-black font-black py-6 rounded-2xl shadow-2xl shadow-yellow-400/50 transition-all active:scale-95 uppercase tracking-widest text-sm mt-6 flex items-center justify-center space-x-3 relative overflow-hidden group"
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.5)" }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          onClick={(e) => {
            console.log('Submit button clicked');
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-white/70 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl shadow-lg backdrop-blur-sm" />
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
