import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Award, Globe, Users, Clock, Zap, Target, Trophy } from 'lucide-react';
import { SEASON_CIRCUIT } from '../constants';

interface TimelineEvent {
  id: string;
  name: string;
  date: string;
  phase: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: 'completed' | 'active' | 'upcoming';
  votingOpens?: string;
  votingCloses?: string;
  ceremonyDate?: string;
}

interface AwardsFunnelProps {
  selectedEventId?: string;
}

const AwardsFunnel: React.FC<AwardsFunnelProps> = ({ selectedEventId }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [pulseEvents, setPulseEvents] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate pulse events for voting dates
    const pulseInterval = setInterval(() => {
      setPulseEvents(['golden-globes-2026-voting', 'baftas-2026-voting', 'sag-2026-voting']);
      setTimeout(() => setPulseEvents([]), 2000);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(pulseInterval);
    };
  }, []);

  const timelineMeta: Record<string, Omit<TimelineEvent, 'id' | 'name' | 'date' | 'status'>> = {
    'golden-globes-2026': {
      phase: 'Momentum & Buzz',
      description: 'The trendsetters kick off awards season with their picks',
      icon: <Globe className="w-5 h-5" />,
      color: 'from-red-500 to-red-600',
      votingOpens: 'Dec 15, 2025',
      votingCloses: 'Jan 10, 2026',
      ceremonyDate: 'Jan 11, 2026'
    },
    'baftas-2026': {
      phase: 'The Final Exam',
      description: 'International industry experts weigh in with their perspective',
      icon: <Award className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      votingOpens: 'Jan 20, 2026',
      votingCloses: 'Feb 22, 2026',
      ceremonyDate: 'Feb 22, 2026'
    },
    'sag-2026': {
      phase: 'The Final Exam',
      description: 'The largest voting body reveals their choices',
      icon: <Users className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      votingOpens: 'Jan 25, 2026',
      votingCloses: 'Mar 1, 2026',
      ceremonyDate: 'Mar 1, 2026'
    },
    'oscars-2026': {
      phase: 'The Coronation',
      description: 'The gold standard crowns the year\'s best',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-yellow-500 to-yellow-600',
      votingOpens: 'Mar 1, 2026',
      votingCloses: 'Mar 15, 2026',
      ceremonyDate: 'Mar 15, 2026'
    }
  };

  const timelineEvents: TimelineEvent[] = SEASON_CIRCUIT.map((event) => {
    const meta = timelineMeta[event.id];
    return {
      id: event.id,
      name: event.name,
      date: event.date,
      phase: meta?.phase || 'Awards Season',
      description: meta?.description || 'A key stop on the awards circuit',
      icon: meta?.icon || <Award className="w-5 h-5" />,
      color: meta?.color || 'from-gray-500 to-gray-600',
      status: 'upcoming',
      votingOpens: meta?.votingOpens,
      votingCloses: meta?.votingCloses,
      ceremonyDate: meta?.ceremonyDate || event.date
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'active':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'upcoming':
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const parseEventDate = (value: string) => new Date(value);

  const sortedEvents = [...timelineEvents].sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
  const today = new Date(currentTime.toDateString());
  const nextIndex = sortedEvents.findIndex((event) => parseEventDate(event.date) >= today);
  const activeIndex = nextIndex === -1 ? sortedEvents.length - 1 : nextIndex;
  const activeEvent = sortedEvents[activeIndex];

  const timelineWithStatus = sortedEvents.map((event, index) => ({
    ...event,
    status: index < activeIndex ? 'completed' : index === activeIndex ? 'active' : 'upcoming'
  })) as TimelineEvent[];

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Momentum & Buzz':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'The Final Exam':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'The Coronation':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const currentStatus = {
    event: activeEvent?.id || null,
    status: activeEvent ? 'active' : 'upcoming',
    message: activeEvent ? `${activeEvent.name} phase active` : 'Season approaching...'
  };

  return (
    <div className="bg-linear-to-br from-gray-900/90 to-black/90 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-yellow-500" />
          The Awards Funnel
        </h3>
        <div className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
          2026 Season Momentum
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-6 italic">
        ⏰ Map the momentum of the 2026 season for your app users
      </p>

      {/* Timeline */}
      <div className="relative">
        {/* Main timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-red-500 via-yellow-500 to-green-500"></div>

        {/* You Are Here Indicator */}
        {currentStatus.event && (
          <div 
            className="absolute left-8 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg z-30 animate-pulse"
            style={{ 
              top: `${activeIndex * 25 + 8}%` 
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
              YOU ARE HERE
            </div>
          </div>
        )}

        {/* Timeline events */}
        <div className="space-y-8">
          {timelineWithStatus.map((event, index) => (
            <div key={event.id} className="relative flex items-start space-x-6">
              {/* Timeline dot */}
              <div className="relative z-10">
                <div 
                  className={`w-16 h-16 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${
                    event.status === 'completed' 
                      ? 'bg-green-500/20 border-green-500' 
                      : event.status === 'active'
                      ? 'bg-yellow-500/20 border-yellow-500 animate-pulse'
                      : 'bg-gray-500/20 border-gray-500'
                  } ${selectedEventId === event.id ? 'ring-2 ring-yellow-400/60' : ''}`}
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <div className={`p-2 rounded-lg bg-linear-to-br ${event.color} text-white`}>
                    {event.icon}
                  </div>
                </div>
                
                {/* Pulse animation for voting dates */}
                {pulseEvents.includes(`${event.id}-voting`) && (
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-yellow-500/30 animate-ping"></div>
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold text-lg mb-1">{event.name}</h4>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-400">{event.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPhaseColor(event.phase)}`}>
                          {event.phase}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(event.status)}`}>
                      {event.status === 'completed' ? '✅ Completed' : 
                       event.status === 'active' ? '🔴 Live Now' : '📅 Upcoming'}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{event.description}</p>

                  {/* Voting timeline */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      <p className="text-xs text-gray-400 mb-1">Voting Opens</p>
                      <p className="text-xs text-white font-medium">{event.votingOpens}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <Target className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                      <p className="text-xs text-gray-400 mb-1">Voting Closes</p>
                      <p className="text-xs text-white font-medium">{event.votingCloses}</p>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <Award className="w-4 h-4 mx-auto mb-1 text-green-400" />
                      <p className="text-xs text-gray-400 mb-1">Ceremony</p>
                      <p className="text-xs text-white font-medium">{event.ceremonyDate}</p>
                    </div>
                  </div>

                  {/* Hover details */}
                  {hoveredEvent === event.id && (
                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">Strategic Impact</span>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {event.id === 'golden-globes-2026' && 
                          'Early momentum builder. Wins here create the narrative that influences other voting bodies.'}
                        {event.id === 'baftas-2026' && 
                          'International perspective crucial for foreign films and diverse performances.'}
                        {event.id === 'sag-2026' && 
                          'Largest voting body. Acting category wins here are strong Oscar predictors.'}
                        {event.id === 'oscars-2026' && 
                          'The final word. Industry peers vote based on technical and artistic merit.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel Analysis */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-bold text-sm">January Phase</span>
          </div>
          <h5 className="text-white font-bold text-sm mb-1">Momentum & Buzz</h5>
          <p className="text-gray-300 text-xs leading-relaxed">
            Golden Globes set the narrative. Early wins create momentum that carries through the season.
          </p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">February Phase</span>
          </div>
          <h5 className="text-white font-bold text-sm mb-1">The Final Exam</h5>
          <p className="text-gray-300 text-xs leading-relaxed">
            BAFTA and SAG provide the most predictive data. Their overlap with Academy voters is crucial.
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold text-sm">March Phase</span>
          </div>
          <h5 className="text-white font-bold text-sm mb-1">The Coronation</h5>
          <p className="text-gray-300 text-xs leading-relaxed">
            The Oscars crown the winners. All previous awards lead to this final judgment.
          </p>
        </div>
      </div>

      {/* Current Time Indicator */}
      <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Current Season Status</span>
          </div>
          <div className="text-right">
            <span className="text-yellow-400 text-sm font-medium">
              {timelineWithStatus.find(e => e.id === currentStatus.event)?.name || 'Between Events'}
            </span>
            {currentStatus.message && (
              <div className="text-xs text-gray-300 mt-1">
                {currentStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwardsFunnel;
