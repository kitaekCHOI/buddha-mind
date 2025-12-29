import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { BookOpen, MessageCircle, Play, Pause, RotateCcw, Sparkles, Send, Flower, Activity, Type } from 'lucide-react';

// Configuration
const MODEL_NAME = 'gemini-3-flash-preview';

// Helper to safely get AI instance
const getAIClient = () => {
  try {
    // eslint-disable-next-line no-restricted-globals
    const env = typeof process !== 'undefined' ? process.env : null;
    const apiKey = env?.API_KEY;

    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey: apiKey });
  } catch (error) {
    console.warn("GoogleGenAI initialization skipped:", error);
    return null;
  }
};

// --- Types ---
type Tab = 'daily' | 'meditation' | 'bowing' | 'chat';
type FontSize = 'small' | 'normal' | 'large';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Font Size Configuration ---
const getTextClasses = (size: FontSize) => {
  switch (size) {
    case 'small':
      return {
        xs: 'text-xs',
        sm: 'text-xs',
        base: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
        '3xl': 'text-2xl',
        '4xl': 'text-3xl',
        '5xl': 'text-4xl',
        '6xl': 'text-5xl',
      };
    case 'large':
      return {
        xs: 'text-base',
        sm: 'text-lg',
        base: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
        '2xl': 'text-4xl',
        '3xl': 'text-5xl',
        '4xl': 'text-6xl',
        '5xl': 'text-7xl',
        '6xl': 'text-8xl',
      };
    case 'normal':
    default:
      return {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl',
      };
  }
};

// --- Components ---

// 1. Daily Wisdom Component
const DailyWisdom = ({ fontSize }: { fontSize: FontSize }) => {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const text = getTextClasses(fontSize);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const ai = getAIClient();
        if (!ai) {
          setQuote("모든 것은 마음에서 일어납니다. 잠시 숨을 고르세요.");
          setLoading(false);
          return;
        }
        
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: "Generate a short, profound, and soothing Buddhist quote or teaching in Korean. It should be one or two sentences long. Do not add explanations, just the quote and the source if applicable.",
        });
        setQuote(response.text || "마음의 평화는 당신 안에 있습니다.");
      } catch (error) {
        setQuote("지나간 일은 지나간 대로, 다가올 일은 다가올 대로 두십시오. 지금 이 순간에 머무르십시오.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center fade-in bg-gradient-to-b from-zen-50 to-white">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-zen-100 max-w-sm w-full transform transition-all hover:scale-[1.02] duration-500">
        <div className="flex justify-center mb-6">
           <div className="p-3 bg-zen-50 rounded-full">
             <Flower className="w-8 h-8 text-zen-500" />
           </div>
        </div>
        <h2 className={`${text.xl} font-semibold text-zen-600 mb-6 tracking-widest serif-font`}>오늘의 법구</h2>
        
        {loading ? (
          <div className={`${text.base} animate-pulse text-gray-400 py-10`}>지혜를 구하는 중...</div>
        ) : (
          <div className="space-y-4">
            <p className={`${text['2xl']} leading-relaxed text-zen-800 break-keep font-medium serif-font`}>
              "{quote}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Meditation Timer Component
const MeditationTimer = ({ fontSize }: { fontSize: FontSize }) => {
  const [duration, setDuration] = useState<number>(5 * 60); 
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const text = getTextClasses(fontSize);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playBellSound = () => {
    try {
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
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
    if (!isActive) initAudio();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      playBellSound();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (!isActive) {
      setTimeLeft(newDuration);
    }
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 fade-in">
      <h2 className={`${text.xl} font-semibold text-zen-600 mb-8 tracking-widest serif-font`}>명상</h2>
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        {/* Background Blur */}
        <div className={`absolute inset-0 rounded-full bg-zen-200 opacity-20 blur-xl transition-all duration-1000 ${isActive ? 'scale-110' : 'scale-100'}`}></div>
        
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 drop-shadow-lg">
          <circle cx="128" cy="128" r="115" stroke="#E6EBE9" strokeWidth="6" fill="white" />
          <circle
            cx="128" cy="128" r="115"
            stroke="#5A7D71" strokeWidth="6" strokeLinecap="round" fill="none"
            strokeDasharray={2 * Math.PI * 115}
            strokeDashoffset={2 * Math.PI * 115 * (1 - progress / 100)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className={`${text['4xl']} font-light text-zen-800 z-10 tabular-nums tracking-wider`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-6 mb-10">
        <button 
          onClick={toggleTimer}
          className="w-16 h-16 rounded-full bg-zen-500 text-white hover:bg-zen-600 transition-all shadow-lg hover:shadow-zen-200 flex items-center justify-center"
        >
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-white text-zen-500 border border-zen-200 hover:bg-zen-50 transition-colors shadow-md flex items-center justify-center"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-zen-100 shadow-sm">
        {[5, 10, 15, 30].map((min) => (
          <button
            key={min}
            onClick={() => handleDurationChange(min * 60)}
            className={`px-4 py-2 rounded-xl ${text.sm} font-medium transition-all ${
              duration === min * 60 
                ? 'bg-zen-100 text-zen-700 shadow-sm' 
                : 'text-gray-400 hover:text-zen-600'
            }`}
          >
            {min}분
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. 108 Bows Counter Component
const BowingCounter = ({ fontSize }: { fontSize: FontSize }) => {
  const [count, setCount] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const text = getTextClasses(fontSize);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playMoktak = () => {
    try {
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const handleBow = () => {
    if (count < 108) {
      playMoktak();
      setCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    if (window.confirm('카운트를 초기화 하시겠습니까?')) {
      setCount(0);
    }
  };

  const progress = (count / 108) * 100;
  const isCompleted = count === 108;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 fade-in relative overflow-hidden bg-zen-50">
      
      {isCompleted && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 fade-in">
           <div className="flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-zen-50 rounded-full flex items-center justify-center mb-6">
                <Flower className="w-12 h-12 text-zen-500 lotus-spin" />
             </div>
             <h2 className={`${text['3xl']} font-bold text-zen-800 mb-4 serif-font`}>정진 성취</h2>
             <p className={`${text.base} text-zen-600 mb-10 leading-relaxed max-w-xs`}>
               108배를 통해 맑고 고요한 마음을<br/>얻으셨습니다.
             </p>
             <button
               onClick={() => setCount(0)}
               className={`px-10 py-4 bg-zen-800 text-white rounded-2xl hover:bg-zen-700 transition-all shadow-lg font-medium ${text.lg}`}
             >
               다시 시작하기
             </button>
           </div>
        </div>
      )}

      <h2 className={`${text.xl} font-semibold text-zen-600 mb-8 tracking-widest serif-font`}>108배</h2>

      <div className="relative w-72 h-72 flex items-center justify-center mb-10" onClick={handleBow}>
        <div className="absolute inset-0 rounded-full bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] cursor-pointer active:scale-[0.98] transition-transform duration-100 flex items-center justify-center border border-zen-100">
            {/* Background Ring */}
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none">
              <circle cx="144" cy="144" r="128" stroke="#E6EBE9" strokeWidth="12" fill="none" />
              <circle
                  cx="144" cy="144" r="128"
                  stroke={isCompleted ? "#5A7D71" : "#D97757"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 128}
                  strokeDashoffset={2 * Math.PI * 128 * (1 - progress / 100)}
                  className="transition-all duration-300 ease-out"
              />
            </svg>

            <div className="flex flex-col items-center z-10 select-none">
                <span className={`${text['5xl']} font-bold ${isCompleted ? 'text-zen-600' : 'text-zen-800'}`}>
                    {count}
                </span>
                <span className={`${text.base} text-gray-400 mt-1 font-medium`}>/ 108</span>
            </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4 w-full max-w-xs">
        <button 
          onClick={handleBow}
          disabled={isCompleted}
          className={`flex-1 py-4 rounded-2xl text-white font-medium shadow-md transition-transform active:scale-95 ${text.lg} ${isCompleted ? 'bg-gray-300' : 'bg-zen-700 hover:bg-zen-800'}`}
        >
          1배 올리기
        </button>
        <button 
          onClick={handleReset}
          className="p-4 rounded-2xl bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};

// 4. AI Monk Counseling Component
const MonkChat = ({ fontSize }: { fontSize: FontSize }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '어서 오세요. 마음이 무거울 때 언제든 찾아오십시오.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const text = getTextClasses(fontSize);

  useEffect(() => {
    const ai = getAIClient();
    if (ai) {
      chatSessionRef.current = ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: "You are a wise, compassionate, and gentle Buddhist monk counselor. Your goal is to listen to the user's troubles and offer advice based on Buddhist teachings (Dharma). Speak in polite, soothing, and warm Korean (honorifics). Keep answers concise but deep.",
        },
      });
      setIsApiAvailable(true);
    } else {
      setIsApiAvailable(false);
      setMessages(prev => [...prev, { role: 'model', text: "시스템 연결이 원활하지 않습니다 (API Key 누락)." }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !isApiAvailable) return;
    
    if (!chatSessionRef.current) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMessage });
      if (result.text) {
        setMessages(prev => [...prev, { role: 'model', text: result.text }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "마음의 연결이 잠시 끊어졌습니다. 다시 말씀해 주십시오." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zen-50 relative fade-in">
        <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-zen-100 flex items-center justify-center sticky top-0 z-10">
            <h2 className={`${text.lg} font-semibold text-zen-700`}>스님과의 대화</h2>
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-24">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-5 rounded-3xl shadow-sm leading-relaxed ${text.base} ${
                msg.role === 'user'
                  ? 'bg-zen-600 text-white rounded-br-none'
                  : 'bg-white text-gray-700 border border-zen-100 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' && <div className="mb-2 text-terracotta-500 text-xs font-bold uppercase tracking-wider">Monk</div>}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-zen-100 p-4 rounded-3xl rounded-bl-none shadow-sm flex gap-2 items-center">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-zen-100">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
            rows={1}
            disabled={!isApiAvailable}
            placeholder={isApiAvailable ? "고민을 적어보세요..." : "연결 불가"}
            className={`flex-1 p-4 rounded-2xl bg-zen-50 border-none focus:ring-2 focus:ring-zen-300 outline-none text-gray-700 placeholder-gray-400 resize-none ${text.base}`}
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim() || !isApiAvailable}
            className="p-4 bg-terracotta-500 text-white rounded-2xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-terracotta-500 transition-colors shadow-lg"
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
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  const toggleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'small') return 'normal';
      if (prev === 'normal') return 'large';
      return 'small';
    });
  };

  const getFontSizeLabel = () => {
    if (fontSize === 'small') return '작게';
    if (fontSize === 'normal') return '보통';
    return '크게';
  };

  return (
    <div className="max-w-md mx-auto h-dvh bg-zen-50 flex flex-col shadow-2xl overflow-hidden relative font-sans text-gray-800">
      {/* Header */}
      <header className="relative h-16 flex items-center justify-end px-6 bg-white/80 backdrop-blur-md border-b border-zen-100 z-20 flex-shrink-0">
        <h1 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-zen-800 flex items-center gap-2 tracking-tight whitespace-nowrap">
            <span className="text-terracotta-500 text-2xl">☸</span> 
            <span className="serif-font">마음의 등불</span>
        </h1>
        <button 
          onClick={toggleFontSize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zen-100 hover:bg-zen-200 transition-colors text-zen-700 text-xs font-medium relative z-10"
        >
          <Type size={14} />
          <span>{getFontSizeLabel()}</span>
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative w-full bg-zen-50">
        {activeTab === 'daily' && <DailyWisdom fontSize={fontSize} />}
        {activeTab === 'meditation' && <MeditationTimer fontSize={fontSize} />}
        {activeTab === 'bowing' && <BowingCounter fontSize={fontSize} />}
        {activeTab === 'chat' && <MonkChat fontSize={fontSize} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t border-zen-100 flex justify-around items-center px-4 pb-safe flex-shrink-0 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)] z-20">
        <NavButton 
          active={activeTab === 'daily'} 
          onClick={() => setActiveTab('daily')} 
          icon={<BookOpen size={24} />} 
          label="법구" 
        />
        <NavButton 
          active={activeTab === 'meditation'} 
          onClick={() => setActiveTab('meditation')} 
          icon={<Sparkles size={24} />} 
          label="명상" 
        />
        <NavButton 
          active={activeTab === 'bowing'} 
          onClick={() => setActiveTab('bowing')} 
          icon={<Activity size={24} />} 
          label="108배" 
        />
        <NavButton 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')} 
          icon={<MessageCircle size={24} />} 
          label="상담" 
        />
      </nav>
    </div>
  );
}

// Helper Sub-component for Navigation
const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactElement; label: string }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
        active 
        ? 'text-zen-700 -translate-y-2' 
        : 'text-gray-400 hover:text-zen-500'
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-zen-100' : 'bg-transparent'}`}>
        {React.cloneElement(icon, { 
            className: active ? 'fill-zen-500/20 stroke-zen-600' : 'stroke-current',
            strokeWidth: active ? 2.5 : 2 
        } as any)}
    </div>
    <span className={`text-[11px] mt-1 font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>
        {label}
    </span>
  </button>
);