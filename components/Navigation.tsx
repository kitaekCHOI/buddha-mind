import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Flower, MessageCircle, BookOpen } from 'lucide-react';
import { AppRoute } from '../types';

const Navigation: React.FC = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
      isActive 
        ? 'text-monk-700' 
        : 'text-stone-400 hover:text-stone-600'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-full max-w-2xl mx-auto px-2">
        <NavLink to={AppRoute.HOME} className={getLinkClass}>
          <Home size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-sans font-medium">홈</span>
        </NavLink>
        <NavLink to={AppRoute.MEDITATION} className={getLinkClass}>
          <Flower size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-sans font-medium">명상</span>
        </NavLink>
        <NavLink to={AppRoute.CHAT} className={getLinkClass}>
          <MessageCircle size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-sans font-medium">스님챗</span>
        </NavLink>
        <NavLink to={AppRoute.SUTRAS} className={getLinkClass}>
          <BookOpen size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-sans font-medium">경전</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;