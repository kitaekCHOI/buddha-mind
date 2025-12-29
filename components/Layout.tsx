import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-temple-50 text-stone-800 font-sans flex flex-col relative overflow-hidden">
      {/* Abstract Background Elements with Breathing Animation */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-temple-100 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[10%] left-[-10%] w-[40vh] h-[40vh] bg-stone-200 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />

      {/* Header */}
      <header className="pt-8 pb-4 px-6 flex items-center justify-center relative z-10">
        <h1 className="text-xl font-serif font-bold text-stone-700 tracking-wide border-b-2 border-monk-500/30 pb-1">
          {title || "마음의 등불"}
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 overflow-y-auto z-10 max-w-2xl mx-auto w-full">
        {children}
      </main>

      <Navigation />
    </div>
  );
};

export default Layout;