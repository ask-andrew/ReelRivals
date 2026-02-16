import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { SOCIAL_SHARE_CONFIG, BAFTA_MARKETING_MESSAGES } from '../marketingConstants';

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  userPicks?: any[];
  userName?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  isOpen,
  onClose,
  userPicks = [],
  userName = 'Anonymous'
}) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  if (!isOpen) return null;

  const shareUrl = SOCIAL_SHARE_CONFIG.url;
  const shareText = userName !== 'Anonymous' 
    ? `${userName} has submitted their BAFTA 2026 picks! 🎭🏆 #BAFTAs2026 #ReelRivals`
    : BAFTA_MARKETING_MESSAGES.socialShare;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: SOCIAL_SHARE_CONFIG.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Native share failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const generatePicksSummary = () => {
    if (userPicks.length === 0) return '';
    
    const topPicks = userPicks.slice(0, 3).map(pick => pick.nominee?.name || pick.nomineeName).join(', ');
    return userPicks.length > 3 
      ? `My top picks include: ${topPicks} and ${userPicks.length - 3} more...`
      : `My picks: ${topPicks}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-slate-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-amber-500/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Share2 className="w-6 h-6 mr-2" />
                Share Your BAFTA Picks
              </h3>
              <button
                onClick={onClose}
                className="text-slate-900 hover:text-slate-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-slate-900 px-6 py-4">
            {/* Preview Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-slate-800 to-amber-900/40 rounded-lg border border-amber-500/20">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                  <span className="text-slate-900 text-xl">🎭</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-100 mb-1">BAFTA 2026 Predictions</h4>
                  <p className="text-sm text-amber-100/80 mb-2">
                    {userName !== 'Anonymous' ? `${userName} has locked in their picks!` : 'I\'ve made my predictions!'}
                  </p>
                  {userPicks.length > 0 && (
                    <p className="text-xs text-amber-100/60 italic">
                      {generatePicksSummary()}
                    </p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-amber-300 font-medium">
                    <span className="mr-2">#BAFTAs2026</span>
                    <span>#ReelRivals</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors duration-200"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </button>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Twitter className="w-5 h-5 mr-2" />
                  Twitter
                </a>

                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                </a>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-100 font-medium rounded-lg transition-colors duration-200 border border-amber-500/20"
              >
                {copiedToClipboard ? (
                  <>
                    <Check className="w-5 h-5 mr-2 text-emerald-400" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 mr-2" />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Open Graph Meta Info */}
            <div className="mt-6 p-3 bg-slate-800/70 rounded-lg border border-amber-500/10">
              <p className="text-xs text-amber-100/60 text-center">
                This share includes optimized preview data for social media platforms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShare;
