import React, { useState } from 'react';
import { BarChart3, Users, Award, Globe, TrendingUp } from 'lucide-react';

interface AwardBody {
  name: string;
  voterCount: number;
  description: string;
  color: string;
  icon: React.ReactNode;
  tooltip: string;
}

const PowerScale: React.FC = () => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const awardBodies: AwardBody[] = [
    {
      name: 'SAG Awards',
      voterCount: 160000,
      description: 'The Voice of the People',
      color: 'bg-linear-to-r from-blue-500 to-blue-600',
      icon: <Users className="w-5 h-5" />,
      tooltip: 'A SAG win represents 160x more individual votes than a Golden Globe win'
    },
    {
      name: 'The Oscars',
      voterCount: 10000,
      description: 'The Gold Standard',
      color: 'bg-linear-to-r from-yellow-500 to-yellow-600',
      icon: <Award className="w-5 h-5" />,
      tooltip: 'The Academy represents the pinnacle of industry recognition'
    },
    {
      name: 'BAFTA',
      voterCount: 8000,
      description: 'The International Industry',
      color: 'bg-linear-to-r from-purple-500 to-purple-600',
      icon: <Globe className="w-5 h-5" />,
      tooltip: 'BAFTA brings global perspective to film recognition'
    },
    {
      name: 'Golden Globes',
      voterCount: 300,
      description: 'The Trendsetters',
      color: 'bg-linear-to-r from-red-500 to-red-600',
      icon: <TrendingUp className="w-5 h-5" />,
      tooltip: 'The Globes set the narrative for awards season'
    }
  ];

  // Calculate relative scale for visualization (logarithmic)
  const maxCount = Math.max(...awardBodies.map(body => body.voterCount));
  const getBarWidth = (count: number) => {
    // Use logarithmic scale for better visualization
    const logScale = Math.log10(count);
    const maxLogScale = Math.log10(maxCount);
    return (logScale / maxLogScale) * 100;
  };

  const getBarHeight = (count: number) => {
    // Alternative: Use square root scale for height
    return Math.sqrt(count / 100) * 20;
  };

  return (
    <div className="bg-linear-to-br from-gray-900/90 to-black/90 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-yellow-500" />
          The Power Scale
        </h3>
        <div className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
          Market Consensus vs Journalist Opinion
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-6 italic">
        📊 Visualize the sheer volume of voices behind each award
      </p>

      {/* Swipeable Cards for Mobile */}
      <div className="overflow-x-auto pb-4 md:hidden">
        <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
          {awardBodies.map((body) => (
            <div 
              key={body.name}
              className="relative group shrink-0 w-72 bg-gray-800/30 rounded-xl p-4 border border-gray-700/30"
              onMouseEnter={() => setHoveredBar(body.name)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg bg-linear-to-br ${body.color} text-white`}>
                  {body.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{body.name}</h4>
                  <p className="text-gray-400 text-xs">{body.description}</p>
                </div>
              </div>

              {/* Voter Count Display */}
              <div className="text-center mb-3">
                <div className="text-3xl font-cinzel font-bold text-white mb-1">
                  {body.voterCount >= 1000 ? `${(body.voterCount / 1000).toFixed(0)}K` : body.voterCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">voters</div>
              </div>

              {/* Bar Visualization */}
              <div className="relative h-8 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-linear-to-r ${body.color} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
                  style={{ width: `${getBarWidth(body.voterCount)}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
                </div>
              </div>

              {/* Key Insight */}
              <div className="bg-gray-700/50 rounded-lg p-3 mt-3">
                <p className="text-gray-300 text-xs leading-relaxed">
                  {body.name === 'SAG Awards' && '160x more votes than Globes'}
                  {body.name === 'The Oscars' && 'Industry gold standard'}
                  {body.name === 'BAFTA' && 'Global perspective'}
                  {body.name === 'Golden Globes' && 'Trendsetters & narrative'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-4 mb-6">
        {awardBodies.map((body) => (
          <div 
            key={body.name}
            className="relative group"
            onMouseEnter={() => setHoveredBar(body.name)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {/* Bar Container */}
            <div className="flex items-center space-x-4">
              {/* Icon and Name */}
              <div className="flex items-center space-x-3 w-48">
                <div className={`p-2 rounded-lg bg-linear-to-br ${body.color} text-white`}>
                  {body.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{body.name}</h4>
                  <p className="text-gray-400 text-xs">{body.description}</p>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex-1 relative">
                <div className="h-12 bg-gray-800/50 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full bg-linear-to-r ${body.color} rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-4 relative overflow-hidden`}
                    style={{ width: `${getBarWidth(body.voterCount)}%` }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
                    
                    {/* Voter count */}
                    <span className="text-white font-bold text-sm drop-shadow-lg z-10">
                      {body.voterCount.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Scale indicator */}
                <div className="absolute -top-6 right-0 text-xs text-gray-500">
                  {body.voterCount >= 1000 ? `${(body.voterCount / 1000).toFixed(0)}K` : body.voterCount} voters
                </div>
              </div>
            </div>

            {/* Tooltip */}
            {hoveredBar === body.name && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-black/95 border border-yellow-500/30 rounded-lg p-4 shadow-xl z-50 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-linear-to-br ${body.color} text-white shrink-0`}>
                    {body.icon}
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm mb-1">{body.name}</h5>
                    <p className="text-gray-300 text-xs leading-relaxed">{body.tooltip}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      <span className="text-yellow-500 font-bold">Scale:</span> Logarithmic (log₁₀)
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 left-8 w-4 h-4 bg-black/95 border-l border-t border-yellow-500/30 transform rotate-45 -translate-y-2"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Insights */}
      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-700/50">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-bold text-sm">People Power</span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            SAG's 160,000 voters represent the largest democratic voice in awards season, making it the most accurate predictor of popular sentiment.
          </p>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">Prestige Factor</span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            While the Oscars have fewer voters, each vote carries immense weight from industry experts and craftspeople.
          </p>
        </div>
      </div>

      {/* Scale Explanation */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 font-bold text-xs">Why Logarithmic Scale?</span>
        </div>
        <p className="text-gray-300 text-xs leading-relaxed">
          The massive difference between SAG (160K) and Globes (300) voters requires a logarithmic scale to visualize all awards meaningfully. 
          This helps you see the relative influence of each award body at a glance.
        </p>
      </div>
    </div>
  );
};

export default PowerScale;
