import React, { useState } from 'react';
import { Share2, Copy, MessageCircle, Facebook, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'invite' | 'win' | 'ballot';
  data?: {
    score?: number;
    rank?: number;
    leagueCode?: string;
    eventName?: string;
    correctPicks?: number;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, type, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getShareText = () => {
    switch (type) {
      case 'invite':
        return `Join my Reel Rivals league! Code: ${data?.leagueCode || 'REELRIVALS'}. Let's see who really knows movies 🏆🍿`;
      case 'win':
        return `I just scored ${data?.score || 0} points and ranked #${data?.rank || 1} in ${data?.eventName || 'Golden Globes'}! Got ${data?.correctPicks || 0} picks right 🎯`;
      case 'ballot':
        return `Locked in my picks for ${data?.eventName || 'Golden Globes'}! Time to see if I know my stuff 🎬`;
      default:
        return 'Check out Reel Rivals - Lights...Camera...Competition!';
    }
  };

  const shareText = getShareText();
  const shareUrl = window.location.origin;

  const handleCopyLink = () => {
    const fullUrl = type === 'invite' 
      ? `${shareUrl}?league=${data?.leagueCode || 'REELRIVALS'}`
      : shareUrl;
    
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reel Rivals - Lights...Camera...Competition!',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'bluesky':
        shareLink = `https://bsky.app/intent/compose?text=${encodedText} ${encodedUrl}`;
        break;
      case 'slack':
        shareLink = `https://slack.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'text':
        shareLink = `sms:?body=${encodedText} ${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-amber-100">Share</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-100 flex items-center justify-center hover:bg-amber-500/20 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="bg-slate-800/70 rounded-2xl p-4 mb-6 border border-amber-500/10">
          <p className="text-sm text-amber-100/90 leading-relaxed">{shareText}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center space-x-3 bg-amber-500 text-slate-900 rounded-2xl py-3 hover:bg-amber-400 transition-colors font-semibold"
          >
            <Copy size={18} />
            <span className="font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center space-x-3 bg-slate-800 text-amber-100 border border-amber-500/30 rounded-2xl py-3 hover:bg-slate-700 transition-colors font-medium"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleSocialShare('bluesky')}
              className="flex flex-col items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[80px]"
            >
              <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 10.8c1.6-2.4 4.8-4.1 7.2-4.1.8 0 1.6.2 2.3.6.5 1.6.5 3.4 0 5-.5 1.5-1.4 2.8-2.6 3.7-1.2.9-2.6 1.4-4.1 1.4s-2.9-.5-4.1-1.4c-1.2-.9-2.1-2.2-2.6-3.7-.5-1.6-.5-3.4 0-5 .7-.4 1.5-.6 2.3-.6 2.4 0 5.6 1.7 7.2 4.1z"/>
              </svg>
              <span className="text-sm font-semibold">Bluesky</span>
            </button>

            <button
              onClick={() => handleSocialShare('slack')}
              className="flex flex-col items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[80px]"
            >
              <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.52-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.958 8.834a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zM17.687 8.834a2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.166 18.958a2.528 2.528 0 0 1 2.521 2.52 2.528 2.528 0 0 1-2.521 2.523 2.527 2.527 0 0 1-2.521-2.522v-2.52h2.521zM15.166 17.687a2.528 2.528 0 0 1-2.521-2.521 2.527 2.527 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.313z"/>
              </svg>
              <span className="text-sm font-semibold">Slack</span>
            </button>

            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center justify-center p-4 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[80px]"
            >
              <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-semibold">Facebook</span>
            </button>

            <button
              onClick={() => handleSocialShare('text')}
              className="flex flex-col items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[80px]"
            >
              <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="text-sm font-semibold">Text</span>
            </button>

            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col items-center justify-center p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[80px]"
            >
              <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm font-semibold">Twitter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
