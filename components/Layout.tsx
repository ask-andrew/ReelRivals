
import React from 'react';
import { Home, Award, Trophy, Users, User as UserIcon, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'ballot' | 'live' | 'leagues' | 'profile' | 'admin';
  onTabChange: (tab: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'ballot', icon: Award, label: 'Ballot' },
    { id: 'live', icon: Trophy, label: 'Live' },
    { id: 'leagues', icon: Users, label: 'The Critics' },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
    { id: 'admin', icon: Settings, label: 'Admin' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white max-w-md mx-auto relative overflow-hidden shadow-2xl">
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
      </nav>
    </div>
  );
};

export default Layout;
