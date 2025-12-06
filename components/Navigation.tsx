import React from 'react';
import { GameMode } from '../types';
import { Grid, Wind, Waves, Move, MessageCircleHeart } from 'lucide-react';

interface NavigationProps {
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: GameMode.BUBBLE_POP, icon: Grid, label: '气泡' },
    { mode: GameMode.BREATH_FOCUS, icon: Wind, label: '呼吸' },
    { mode: GameMode.COSMIC_FLOW, icon: Move, label: '流光' },
    { mode: GameMode.ZEN_SAND, icon: Waves, label: '沙盘' },
    { mode: GameMode.VENT_BOX, icon: MessageCircleHeart, label: '清除' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 md:h-20 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentMode === item.mode;
          const Icon = item.icon;
          return (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className={`
                flex flex-col items-center justify-center w-full h-full space-y-1
                transition-all duration-200
                ${isActive ? 'text-mind-accent' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-mind-accent/10 translate-y-[-2px]' : ''}`}>
                 <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;