
import React, { useState } from 'react';
import { Flower, Sun, Activity, BookOpen, MessageCircle, Type } from 'lucide-react';
import { DailyWisdom, MeditationTimer, BowingCounter, ScriptureReader, SpiritualCounseling } from './components';

type Tab = 'daily' | 'meditation' | 'bowing' | 'scripture' | 'chat';
type FontSize = 'small' | 'normal' | 'large';

const App = () => {
  const [tab, setTab] = useState<Tab>('daily');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [showSettings, setShowSettings] = useState(false);

  const renderContent = () => {
    switch (tab) {
      case 'daily': return <DailyWisdom fontSize={fontSize} />;
      case 'meditation': return <MeditationTimer fontSize={fontSize} />;
      case 'bowing': return <BowingCounter fontSize={fontSize} />;
      case 'scripture': return <ScriptureReader fontSize={fontSize} />;
      case 'chat': return <SpiritualCounseling fontSize={fontSize} />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button onClick={() => setTab(id)} className={`flex flex-col items-center justify-center w-full h-full transition-all ${tab === id ? 'text-zen-600' : 'text-gray-300'}`}>
      <Icon size={24} strokeWidth={tab === id ? 2.5 : 2} className={tab === id ? 'scale-110' : ''} />
      <span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-dvh bg-zen-50 text-zen-800 overflow-hidden select-none">
      <header className="flex justify-between items-center p-4 px-6 bg-white border-b border-zen-50 shadow-sm z-30">
        <h1 className="text-xl font-bold flex items-center gap-2 serif-font tracking-tight text-zen-700">
          <Flower className="text-zen-500 lotus-spin" size={26} /> 마음의 등불
        </h1>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-400 hover:text-zen-500">
          <Type size={22} />
        </button>
      </header>

      {showSettings && (
        <div className="absolute top-16 right-4 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-zen-50 z-50 fade-in w-52">
          <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">글자 크기</p>
          <div className="space-y-2">
            {(['small', 'normal', 'large'] as FontSize[]).map(s => (
              <button key={s} onClick={() => { setFontSize(s); setShowSettings(false); }}
                className={`w-full py-3 rounded-xl text-sm font-medium border transition-all ${fontSize === s ? 'bg-zen-600 border-zen-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-600'}`}>
                {s === 'small' ? '작게' : s === 'normal' ? '보통' : '크게'}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      <nav className="bg-white/90 backdrop-blur-lg border-t border-zen-50 pb-[env(safe-area-inset-bottom)] z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 px-2">
          <NavItem id="daily" icon={Sun} label="오늘" />
          <NavItem id="meditation" icon={Activity} label="명상" />
          <NavItem id="bowing" icon={Flower} label="108배" />
          <NavItem id="scripture" icon={BookOpen} label="경전" />
          <NavItem id="chat" icon={MessageCircle} label="상담" />
        </div>
      </nav>
    </div>
  );
};

export default App;
