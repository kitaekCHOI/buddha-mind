import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { BookOpen, Mic, MessageCircle, Play, Pause, RotateCcw, Sparkles, Send, Flower, User, Bot } from 'lucide-react';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

// --- Types ---
type Tab = 'daily' | 'meditation' | 'chat';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Components ---

// 1. Daily Wisdom Component
const DailyWisdom = () => {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: "Generate a short, profound, and soothing Buddhist quote or teaching in Korean. It should be one or two sentences long. Do not add explanations, just the quote and the source if applicable.",
        });
        setQuote(response.text || "마음의 평화는 당신 안에 있습니다.");
      } catch (error) {
        console.error("Error fetching quote:", error);
        setQuote("모든 것은 마음에서 일어납니다. 잠시 숨을 고르세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center fade-in">
      <Flower className="w-16 h-16 text-amber-600 mb-6 opacity-80" />
      <h2 className="text-xl font-semibold text-stone-600 mb-8 tracking-widest">오늘의 법구</h2>
      
      {loading ? (
        <div className="animate-pulse text-stone-400">지혜를 구하는 중...</div>
      ) : (
        <div className="max-w-md p-8 bg-white shadow-lg rounded-2xl border border-stone-100">
          <p className="text-2xl leading-relaxed text-stone-800 break-keep font-medium">
            "{quote}"
          </p>
        </div>
      )}
    </div>
  );
};

// 2. Meditation Timer Component
const MeditationTimer = () => {
  const [duration, setDuration] = useState<number>(5 * 60); // Default 5 min
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playBellSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Bell sound simulation
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      
      osc.start();
      osc.stop(ctx.currentTime + 3);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      playBellSound();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  // Update timeLeft when duration changes (only if not active)
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (!isActive) {
      setTimeLeft(newDuration);
    }
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 fade-in">
      <h2 className="text-xl font-semibold text-stone-600 mb-8 tracking-widest">명상</h2>
      
      {/* Timer Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="#e7e5e4"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="#d97706"
            strokeWidth="8"
            fill="none"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="text-5xl font-light text-stone-800 z-10">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 mb-8">
        <button 
          onClick={toggleTimer}
          className="p-4 rounded-full bg-stone-800 text-white hover:bg-stone-700 transition-colors shadow-lg"
          aria-label={isActive ? "Pause" : "Start"}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors shadow-md"
          aria-label="Reset"
        >
          <RotateCcw size={32} />
        </button>
      </div>

      {/* Duration Selector */}
      <div className="flex gap-3">
        {[5, 10, 15, 30].map((min) => (
          <button
            key={min}
            onClick={() => handleDurationChange(min * 60)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              duration === min * 60 
                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {min}분
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. AI Monk Counseling Component
const MonkChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '어서 오세요. 저는 당신의 이야기를 들어줄 마음의 벗입니다. 어떤 고민이 있으신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      // Construct history for context
      // Limit context to last few turns to save tokens if needed, but for text it's usually fine
      const history = messages.map(m => 
        m.role === 'user' ? `User: ${m.text}` : `Model: ${m.text}`
      ).join('\n');
      
      const prompt = `${history}\nUser: ${userMessage}\nModel:`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
            {
                role: 'user',
                parts: [{ text: userMessage }]
            }
        ],
        config: {
          systemInstruction: "You are a wise, compassionate, and gentle Buddhist monk counselor. Your goal is to listen to the user's troubles and offer advice based on Buddhist teachings (Dharma), such as mindfulness, impermanence, compassion, and letting go. Speak in polite, soothing, and warm Korean (honorifics). Keep answers concise but deep. Avoid overly religious jargon if simple words suffice, but use Buddhist concepts naturally.",
        }
      });

      const responseText = response.text;
      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "죄송합니다. 잠시 마음의 연결이 고르지 못합니다. 다시 말씀해 주시겠습니까?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 relative fade-in">
        {/* Header inside chat for mobile feel */}
        <div className="p-4 bg-white border-b border-stone-100 flex items-center justify-center">
            <h2 className="text-lg font-semibold text-stone-600">스님과의 대화</h2>
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-20">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-stone-700 text-white rounded-tr-none'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
              }`}
            >
              {msg.role === 'model' && <div className="mb-1 text-amber-600 text-xs font-bold">스님</div>}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-stone-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="마음의 고민을 털어놓으세요..."
            className="flex-1 p-3 rounded-full bg-stone-100 border-none focus:ring-2 focus:ring-stone-400 outline-none text-stone-700 placeholder-stone-400"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');

  return (
    <div className="max-w-md mx-auto h-screen bg-[#fdfbf7] flex flex-col shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white/50 backdrop-blur-sm border-b border-stone-100 z-10">
        <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <span className="text-amber-600 text-2xl">☸</span> 마음의 등불
        </h1>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'daily' && <DailyWisdom />}
        {activeTab === 'meditation' && <MeditationTimer />}
        {activeTab === 'chat' && <MonkChat />}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t border-stone-100 flex justify-around items-center px-2 pb-2">
        <button
            onClick={() => setActiveTab('daily')}
            className={`flex flex-col items-center p-3 transition-colors ${activeTab === 'daily' ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'}`}
        >
            <BookOpen size={24} className={activeTab === 'daily' ? 'fill-amber-100' : ''} />
            <span className="text-xs mt-1 font-medium">오늘의 말씀</span>
        </button>
        <button
            onClick={() => setActiveTab('meditation')}
            className={`flex flex-col items-center p-3 transition-colors ${activeTab === 'meditation' ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'}`}
        >
            <Sparkles size={24} className={activeTab === 'meditation' ? 'fill-amber-100' : ''} />
            <span className="text-xs mt-1 font-medium">명상</span>
        </button>
        <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center p-3 transition-colors ${activeTab === 'chat' ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'}`}
        >
            <MessageCircle size={24} className={activeTab === 'chat' ? 'fill-amber-100' : ''} />
            <span className="text-xs mt-1 font-medium">상담소</span>
        </button>
      </nav>
    </div>
  );
}

// Mounting Logic
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
