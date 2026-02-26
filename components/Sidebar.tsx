
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  schoolLogo: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, schoolLogo, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'students', label: 'Students', icon: 'fa-user-graduate' },
    { id: 'teachers', label: 'Teachers', icon: 'fa-chalkboard-teacher' },
    { id: 'grading', label: 'Grading', icon: 'fa-file-signature' },
    { id: 'reports', label: 'Report Cards', icon: 'fa-print' },
    { id: 'notifications', label: 'Communication Hub', icon: 'fa-envelope-open-text' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-[200] w-64 bg-indigo-900 text-white flex flex-col transition-all duration-300 transform lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-orange-500 shadow-inner">
              <img 
                src={schoolLogo} 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=CC&background=f59e0b&color=fff";
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-indigo-900 flex items-center justify-center">
              <i className="fas fa-check text-[8px] text-white"></i>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter uppercase leading-none text-orange-400">Cedar Crest</span>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1">International</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <nav className="mt-8 flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-indigo-700 text-white shadow-lg border-l-4 border-orange-500' 
                : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} text-lg w-6 transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-orange-400' : ''}`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-indigo-800/50 rounded-2xl p-4 border border-indigo-700/50">
          <p className="text-xs text-indigo-300 uppercase font-semibold mb-2">School Term</p>
          <p className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            FIRST TERM 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
