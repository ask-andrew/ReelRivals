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
        return 'Check out Reel Rivals - the ultimate awards prediction game!';
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
          title: 'Reel Rivals',
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-black">Share</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="bg-black/5 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-700 leading-relaxed">{shareText}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center space-x-3 bg-black text-white rounded-2xl py-3 hover:bg-black/90 transition-colors"
          >
            <Copy size={18} />
            <span className="font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center space-x-3 bg-yellow-500 text-black rounded-2xl py-3 hover:bg-yellow-400 transition-colors font-medium"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSocialShare('bluesky')}
              className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-colors"
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full mb-1"></div>
              <span className="text-xs font-medium">Bluesky</span>
            </button>

            <button
              onClick={() => handleSocialShare('slack')}
              className="flex flex-col items-center justify-center p-3 bg-purple-100 rounded-2xl hover:bg-purple-200 transition-colors"
            >
              <MessageCircle size={16} className="mb-1" />
              <span className="text-xs font-medium">Slack</span>
            </button>

            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-colors"
            >
              <Facebook size={16} className="mb-1" />
              <span className="text-xs font-medium">Facebook</span>
            </button>

            <button
              onClick={() => handleSocialShare('text')}
              className="flex flex-col items-center justify-center p-3 bg-green-100 rounded-2xl hover:bg-green-200 transition-colors"
            >
              <Send size={16} className="mb-1" />
              <span className="text-xs font-medium">Text</span>
            </button>

            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col items-center justify-center p-3 bg-sky-100 rounded-2xl hover:bg-sky-200 transition-colors"
            >
              <div className="w-6 h-6 bg-sky-500 rounded-full mb-1"></div>
              <span className="text-xs font-medium">Twitter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
