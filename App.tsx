import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MeditationTimer from './components/MeditationTimer';
import ChatBot from './components/ChatBot';
import SutraList from './components/SutraList';
import { AppRoute } from './types';
import { generateDailyQuote } from './services/gemini';
import { Sun } from 'lucide-react';

const HomeScreen: React.FC = () => {
  const [quote, setQuote] = useState<string>("마음을 비우면 세상이 들어온다.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a cached quote for today in localStorage
    const cachedData = localStorage.getItem('dailyQuote');
    const today = new Date().toDateString();

    if (cachedData) {
      const { date, text } = JSON.parse(cachedData);
      if (date === today) {
        setQuote(text);
        setLoading(false);
        return;
      }
    }

    // Fetch new quote
    generateDailyQuote().then(text => {
      setQuote(text);
      localStorage.setItem('dailyQuote', JSON.stringify({ date: today, text }));
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 pt-10">
      <div className="w-24 h-24 bg-gradient-to-br from-monk-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg mb-4 animate-fade-in">
        <Sun size={48} className="text-white opacity-90" />
      </div>

      <div className="text-center space-y-6 max-w-xs mx-auto">
        <h2 className="text-sm font-bold tracking-widest text-stone-400 uppercase">
          오늘의 가르침
        </h2>
        
        {loading ? (
          <div className="animate-pulse h-24 bg-stone-200 rounded-lg w-full"></div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 relative">
            <span className="absolute top-4 left-4 text-4xl text-stone-200 font-serif">"</span>
            <p className="font-serif text-lg text-stone-700 leading-relaxed">
              {quote}
            </p>
            <span className="absolute bottom-[-10px] right-8 text-4xl text-stone-200 font-serif rotate-180">"</span>
          </div>
        )}
      </div>

      <div className="pt-8 text-center text-stone-400 text-xs">
        <p>오늘도 자비롭고 평온한 하루 되십시오.</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path={AppRoute.HOME} 
          element={
            <Layout title="마음의 등불">
              <HomeScreen />
            </Layout>
          } 
        />
        <Route 
          path={AppRoute.MEDITATION} 
          element={
            <Layout title="명상">
              <MeditationTimer />
            </Layout>
          } 
        />
        <Route 
          path={AppRoute.CHAT} 
          element={
            <Layout title="스님과의 대화">
              <ChatBot />
            </Layout>
          } 
        />
        <Route 
          path={AppRoute.SUTRAS} 
          element={
            <Layout title="경전 읽기">
              <SutraList />
            </Layout>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;