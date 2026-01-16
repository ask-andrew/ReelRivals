import React, { useEffect, useState } from 'react';
import { Target, Users, Globe, TrendingUp, Award, Info } from 'lucide-react';

interface Circle {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  description: string;
  overlapPercentage?: number;
  icon: React.ReactNode;
}

const VoterOverlap: React.FC = () => {
  const [hoveredCircle, setHoveredCircle] = useState<string | null>(null);
  const [showInsight, setShowInsight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const applyMatch = (matches: boolean) => {
      setIsMobile(matches);
      setShowDiagram(matches ? false : true);
    };

    applyMatch(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyMatch(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const circles: Circle[] = [
    {
      id: 'oscars',
      name: 'The Oscars',
      x: 50,
      y: 50,
      size: 180,
      color: 'rgba(250, 204, 21, 0.3)',
      description: 'The Gold Standard - 10,000 industry voters',
      icon: <Award className="w-6 h-6" />
    },
    {
      id: 'sag',
      name: 'SAG Awards',
      x: 35,
      y: 50,
      size: 140,
      color: 'rgba(59, 130, 246, 0.4)',
      description: 'The Union Giant - 160,000 actors',
      overlapPercentage: 100,
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'bafta',
      name: 'BAFTA',
      x: 65,
      y: 45,
      size: 100,
      color: 'rgba(168, 85, 247, 0.3)',
      description: 'The Global Bridge - 8,000 international voters',
      overlapPercentage: 10,
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'globes',
      name: 'Golden Globes',
      x: 80,
      y: 70,
      size: 60,
      color: 'rgba(239, 68, 68, 0.3)',
      description: 'The Influencer - 300 journalists',
      overlapPercentage: 0,
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  const summaryCards = [
    {
      id: 'sag',
      title: 'SAG → Oscars',
      metric: '160K voters',
      highlight: '13% of the Academy',
      description: 'SAG victories mirror the Oscars acting branch, making them the strongest predictor.',
      accent: 'blue',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'bafta',
      title: 'BAFTA Reach',
      metric: '8K voters',
      highlight: '10% overlap',
      description: 'BAFTA adds international perspective and often signals global momentum shifts.',
      accent: 'purple',
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'globes',
      title: 'Golden Globes Buzz',
      metric: '300 voters',
      highlight: 'Narrative control',
      description: 'The Globes don’t overlap with the Academy, but they create early-season storylines.',
      accent: 'red',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  const diagramVisible = !isMobile || showDiagram;

  const getCircleStyle = (circle: Circle) => ({
    left: `${circle.x}%`,
    top: `${circle.y}%`,
    width: `${circle.size}px`,
    height: `${circle.size}px`,
    transform: 'translate(-50%, -50%)',
    backgroundColor: circle.color,
    borderColor: circle.color.replace('0.3', '0.8').replace('0.4', '0.8'),
    borderWidth: hoveredCircle === circle.id ? '3px' : '2px'
  });

  const getOverlapLabel = (circleId: string) => {
    switch (circleId) {
      case 'sag':
        return '100% Acting Branch';
      case 'bafta':
        return '10% Academy';
      case 'globes':
        return 'No Overlap';
      default:
        return '';
    }
  };

  return (
    <div className="bg-linear-to-br from-gray-900/90 to-black/90 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Target className="w-6 h-6 mr-2 text-yellow-500" />
          The Voter Overlap
        </h3>
        <div className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
          The Predictive Engine
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-6 italic">
        🎯 Show users which awards actually "matter" for predicting the Oscars
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.id}
            className={`rounded-xl p-4 border ${
              card.accent === 'blue'
                ? 'bg-blue-500/10 border-blue-500/30'
                : card.accent === 'purple'
                ? 'bg-purple-500/10 border-purple-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-bold text-sm">{card.title}</h4>
              <div className="p-2 rounded-lg bg-black/40 text-white">{card.icon}</div>
            </div>
            <div className="text-2xl font-cinzel font-bold text-white mb-1">{card.metric}</div>
            <div className="text-xs font-bold text-yellow-400 mb-2">{card.highlight}</div>
            <p className="text-gray-300 text-xs leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Mobile Toggle for Diagram */}
      {isMobile && (
        <div className="mb-4">
          <button
            onClick={() => setShowDiagram((prev) => !prev)}
            className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded-lg py-2 text-sm font-semibold transition-colors"
          >
            {showDiagram ? 'Hide Overlap Map' : 'View Overlap Map'}
          </button>
        </div>
      )}

      {/* Visualization Container */}
      {diagramVisible && (
        <div className="relative bg-gray-800/30 rounded-xl p-6 md:p-8 mb-6 border border-gray-700/30" style={{ minHeight: '320px' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Define gradients */}
          <defs>
            <linearGradient id="oscarsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(250, 204, 21, 0.6)" />
              <stop offset="100%" stopColor="rgba(250, 204, 21, 0.2)" />
            </linearGradient>
            <linearGradient id="sagGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.7)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
            </linearGradient>
            <linearGradient id="baftaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.6)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.2)" />
            </linearGradient>
            <linearGradient id="globesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.5)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.2)" />
            </linearGradient>
          </defs>

          {/* Overlap highlights */}
          <ellipse
            cx="42%"
            cy="50%"
            rx="60"
            ry="80"
            fill="url(#sagGradient)"
            opacity={hoveredCircle === 'sag' ? 0.8 : 0.6}
            className="transition-opacity duration-300"
          />
          
          <ellipse
            cx="58%"
            cy="48%"
            rx="40"
            ry="50"
            fill="url(#baftaGradient)"
            opacity={hoveredCircle === 'bafta' ? 0.7 : 0.5}
            className="transition-opacity duration-300"
          />
        </svg>

        {/* Circles */}
        {circles.map((circle) => (
          <div
            key={circle.id}
            className={`absolute rounded-full border-2 transition-all duration-300 cursor-pointer ${
              hoveredCircle === circle.id ? 'z-20 scale-105' : 'z-10'
            }`}
            style={getCircleStyle(circle)}
            onMouseEnter={() => setHoveredCircle(circle.id)}
            onMouseLeave={() => setHoveredCircle(null)}
          >
            {/* Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
              {circle.icon}
            </div>
            
            {/* Label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
              <p className="text-white font-bold text-sm">{circle.name}</p>
              {circle.overlapPercentage !== undefined && (
                <p className={`text-xs font-bold ${
                  circle.overlapPercentage === 100 ? 'text-green-400' : 
                  circle.overlapPercentage === 10 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {getOverlapLabel(circle.id)}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Floating insight indicator */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowInsight(!showInsight)}
            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-2 rounded-lg transition-colors border border-yellow-500/30"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredCircle && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 w-80 bg-black/95 border border-yellow-500/30 rounded-lg p-4 shadow-xl z-50 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-gray-700 text-white shrink-0">
              {circles.find(c => c.id === hoveredCircle)?.icon}
            </div>
            <div>
              <h5 className="text-white font-bold text-sm mb-1">
                {circles.find(c => c.id === hoveredCircle)?.name}
              </h5>
              <p className="text-gray-300 text-xs leading-relaxed">
                {circles.find(c => c.id === hoveredCircle)?.description}
              </p>
              {circles.find(c => c.id === hoveredCircle)?.overlapPercentage !== undefined && (
                <div className="mt-2">
                  <span className={`text-xs font-bold ${
                    circles.find(c => c.id === hoveredCircle)?.overlapPercentage === 100 ? 'text-green-400' : 
                    circles.find(c => c.id === hoveredCircle)?.overlapPercentage === 10 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {circles.find(c => c.id === hoveredCircle)?.overlapPercentage}% overlap with Academy
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Insight */}
      {showInsight && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">Analytics Insight</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Since SAG actors make up <span className="text-yellow-400 font-bold">13%</span> of the Academy, 
            a SAG win is the most mathematically significant predictor for an Oscar. 
            The 100% overlap in the acting branch creates a powerful predictive signal.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm mb-2">Predictive Power</h4>
          
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">High Overlap</p>
              <p className="text-gray-400 text-xs">Strong Oscar predictor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">Partial Overlap</p>
              <p className="text-gray-400 text-xs">Moderate predictor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-white text-sm font-medium">No Overlap</p>
              <p className="text-gray-400 text-xs">Influencer only</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm mb-2">Key Takeaways</h4>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-400 text-xs font-bold mb-1">🎭 Acting Categories</p>
            <p className="text-gray-300 text-xs">SAG is the most reliable predictor due to 100% acting branch overlap</p>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <p className="text-purple-400 text-xs font-bold mb-1">🌍 International Films</p>
            <p className="text-gray-300 text-xs">BAFTA provides valuable insight for non-American productions</p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-xs font-bold mb-1">📰 Early Buzz</p>
            <p className="text-gray-300 text-xs">Globes set narrative but don't predict winners</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterOverlap;
