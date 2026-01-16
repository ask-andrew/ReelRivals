import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, Trophy, AlertTriangle, BarChart3, Crown, Share2 } from 'lucide-react';

interface AnalyticsCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

interface SwipeableAnalyticsCardsProps {
  children: React.ReactNode[];
  cards: AnalyticsCard[];
}

const SwipeableAnalyticsCards: React.FC<SwipeableAnalyticsCardsProps> = ({ children, cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Determine swipe direction and intent
    if (Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500) {
      if (offset.x > 0) {
        // Swiped right - go to previous card
        handlePrevious();
      } else {
        // Swiped left - go to next card  
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < children.length - 1) {
      setDragDirection('left');
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDragDirection('right');
      setCurrentIndex(prev => prev - 1);
    }
  };

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    if (newDirection > 0) {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto">
      {/* Card Stack */}
      <div className="relative h-[600px] mb-8">
        <AnimatePresence initial={false} custom={currentIndex > 0 ? 1 : -1}>
          <motion.div
            key={currentIndex}
            custom={currentIndex > 0 ? 1 : -1}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mb-6">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-blue-500 w-8' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-between items-center px-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full transition-all duration-300 ${
            currentIndex === 0 
              ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
              : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Card Counter */}
        <div className="text-white/60 text-sm font-medium">
          {currentIndex + 1} / {children.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === children.length - 1}
          className={`p-3 rounded-full transition-all duration-300 ${
            currentIndex === children.length - 1 
              ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
              : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Swipe Hint */}
      <div className="text-center mt-4">
        <p className="text-white/40 text-xs italic">
          Swipe or use arrows to navigate
        </p>
      </div>
    </div>
  );
};

export default SwipeableAnalyticsCards;
