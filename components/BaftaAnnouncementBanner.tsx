import React, { useState, useEffect } from 'react';
import { Clock, Trophy, Bell, Share2, X } from 'lucide-react';
import { BAFTA_MARKETING_MESSAGES, COUNTDOWN_CONFIG } from '../marketingConstants';
import { signupForEventNotifications } from '../src/instantService';

interface BaftaAnnouncementBannerProps {
  onClose: () => void;
  onSubmitPicks: () => void;
  onShare: () => void;
  userId?: string;
}

const BaftaAnnouncementBanner: React.FC<BaftaAnnouncementBannerProps> = ({
  onClose,
  onSubmitPicks,
  onShare,
  userId
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isFinalCall, setIsFinalCall] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // BAFTA deadline: Feb 22, 2026 5:00 PM GMT
  const deadline = new Date('2026-02-22T17:00:00+00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });

        // Check urgency thresholds
        const totalHours = days * 24 + hours;
        setIsUrgent(totalHours < COUNTDOWN_CONFIG.urgentThreshold);
        setIsFinalCall(totalHours < COUNTDOWN_CONFIG.finalCallThreshold);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsUrgent(true);
        setIsFinalCall(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, COUNTDOWN_CONFIG.pulseInterval);

    return () => clearInterval(timer);
  }, []);

  const getMessage = () => {
    if (isFinalCall) return BAFTA_MARKETING_MESSAGES.finalCall;
    if (timeLeft.days <= 7 && timeLeft.days > 0) return BAFTA_MARKETING_MESSAGES.reminder;
    return BAFTA_MARKETING_MESSAGES.launch;
  };

  const handleNotificationSignup = async () => {
    if (!userId) return;
    
    setIsNotifying(true);
    try {
      const result = await signupForEventNotifications(userId, 'baftas-2026');
      if (result.success) {
        setNotificationSuccess(true);
        setTimeout(() => {
          setShowNotificationModal(false);
          setNotificationSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Notification signup failed:', error);
    } finally {
      setIsNotifying(false);
    }
  };

  const getCountdownColor = () => {
    if (isFinalCall) return COUNTDOWN_CONFIG.colors.final;
    if (isUrgent) return COUNTDOWN_CONFIG.colors.urgent;
    return COUNTDOWN_CONFIG.colors.normal;
  };

  return (
    <>
      {/* Main Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-900 to-slate-900 text-white">
        {/* Background with cinema/trophy silhouette */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-black">
            <div className="h-full w-full bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
        </div>

        <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Left side - Message and countdown */}
              <div className="flex-1 mb-4 lg:mb-0">
                <div className="flex items-center mb-3">
                  <Trophy className="w-8 h-8 text-amber-400 mr-3" />
                  <h2 className="text-2xl font-bold text-amber-100">BAFTA 2026</h2>
                </div>
                
                <p className="text-lg text-amber-50 mb-4 max-w-2xl">
                  {getMessage()}
                </p>

                {/* Countdown Timer */}
                <div className={`flex items-center space-x-4 ${isUrgent ? 'animate-pulse' : ''}`}>
                  <Clock className="w-5 h-5" style={{ color: getCountdownColor() }} />
                  <div className="flex space-x-3">
                    {[
                      { value: timeLeft.days, label: 'Days' },
                      { value: timeLeft.hours, label: 'Hours' },
                      { value: timeLeft.minutes, label: 'Mins' },
                      { value: timeLeft.seconds, label: 'Secs' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="text-2xl font-bold font-mono bg-black/30 px-3 py-1 rounded"
                          style={{ 
                            color: getCountdownColor(),
                            textShadow: isUrgent ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
                          }}
                        >
                          {String(item.value).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-amber-200 mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-8">
                <button
                  onClick={onSubmitPicks}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Submit Your Picks
                </button>

                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 font-medium rounded-lg border border-amber-400/30 hover:border-amber-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  Get Notified
                </button>

                <button
                  onClick={onShare}
                  className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 font-medium rounded-lg border border-amber-400/30 hover:border-amber-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-3 text-amber-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowNotificationModal(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-slate-900 to-amber-900 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Bell className="w-6 h-6 mr-2 text-amber-400" />
                  BAFTA Reminders
                </h3>
              </div>

              <div className="bg-white px-6 py-4">
                {notificationSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <p className="text-gray-700 font-medium">You're all set! We'll remind you before the BAFTA deadline.</p>
                  </div>
                ) : userId ? (
                  <>
                    <p className="text-gray-700 mb-4">
                      Get notified about important BAFTA deadlines and announcements:
                    </p>
                    <ul className="text-sm text-gray-600 mb-4 space-y-2">
                      <li>• 1 week reminder</li>
                      <li>• 24 hour warning</li>
                      <li>• Final 2 hour call</li>
                      <li>• Winners announcement</li>
                    </ul>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-700 font-medium">Sign in to enable BAFTA reminders.</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                {!notificationSuccess && userId && (
                  <>
                    <button
                      onClick={() => setShowNotificationModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNotificationSignup}
                      disabled={isNotifying}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isNotifying ? 'Signing up...' : 'Get Reminders'}
                    </button>
                  </>
                )}
                {notificationSuccess && (
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200"
                  >
                    Done
                  </button>
                )}
                {!notificationSuccess && !userId && (
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BaftaAnnouncementBanner;
