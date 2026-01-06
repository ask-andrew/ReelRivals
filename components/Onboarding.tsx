
import React, { useState } from 'react';
import { User, Avatar } from '../types';

interface OnboardingProps {
  onComplete: (user: User) => void;
}

const AVATARS: Avatar[] = ['🎬', '🍿', '🏆', '🎭', '🎥', '✨', '🌟', '📺'];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>('🎬');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete({
        id: Math.random().toString(36).substr(2, 9),
        displayName: name,
        avatar: selectedAvatar,
        totalScore: 0,
        email: email.trim() || undefined
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-black via-gray-950 to-yellow-950/20">
      <div className="mb-12">
        <h1 className="text-5xl font-cinzel font-bold text-yellow-500 mb-2 drop-shadow-md tracking-tighter">REEL RIVALS</h1>
        <p className="text-gray-400 font-light tracking-[0.3em] text-[10px] uppercase">Cinema's Ultimate Prediction League</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-sm">
        <div className="space-y-4">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">1. Choose Your Persona</label>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={`text-2xl p-3 rounded-xl transition-all ${
                  selectedAvatar === avatar 
                    ? 'bg-yellow-500/20 border border-yellow-500 scale-105 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                    : 'bg-white/5 border border-white/5 grayscale hover:grayscale-0'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">2. Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. OscarWinner99"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">3. Email Address</label>
            <span className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">Optional</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="For season alerts & updates"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
          <p className="text-[10px] text-gray-600 text-left italic px-1">We'll notify you when new ballots open for the next show.</p>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-5 rounded-xl shadow-xl shadow-yellow-900/10 transition-all active:scale-95 uppercase tracking-widest text-xs mt-4"
        >
          Enter the Circuit
        </button>
      </form>

      <div className="mt-12 flex items-center space-x-2 text-gray-700">
        <div className="h-px w-4 bg-gray-800"></div>
        <p className="text-[10px] uppercase font-bold tracking-widest">No passwords. Instant access.</p>
        <div className="h-px w-4 bg-gray-800"></div>
      </div>
    </div>
  );
};

export default Onboarding;
