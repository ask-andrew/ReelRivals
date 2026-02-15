
import React from 'react';
import { Home, Award, Trophy, Users, User as UserIcon, BarChart3, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'ballot' | 'live' | 'leagues' | 'profile' | 'analytics';
  onTabChange: (tab: any) => void;
  onSignOut: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onSignOut }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Season' },
    { id: 'ballot', icon: Award, label: 'Vote' },
    { id: 'live', icon: Trophy, label: 'Results' },
    { id: 'leagues', icon: Users, label: 'Critics' },
    { id: 'analytics', icon: BarChart3, label: 'Stats' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Floating Make Picks Button */}
      {activeTab !== 'ballot' && (
        <button
          onClick={() => onTabChange('ballot')}
          className="fixed top-24 right-6 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-full p-4 shadow-2xl shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 z-40 group animate-bounce"
          title="Make Your Picks"
        >
          <Award size={20} strokeWidth={2.5} />
          <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black/90 text-yellow-400 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-yellow-500/30">
            Make Picks Now
          </span>
        </button>
      )}
      
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/90 backdrop-blur-lg border-t border-yellow-900/30 px-6 py-4 flex justify-between items-center z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium tracking-wide uppercase">{tab.label}</span>
            </button>
          );
        })}
        
        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="flex flex-col items-center text-red-500 hover:text-red-400 transition-all duration-300"
          title="Sign Out"
        >
          <LogOut size={24} strokeWidth={2} />
          <span className="text-[10px] mt-1 font-medium tracking-wide uppercase">Sign Out</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
