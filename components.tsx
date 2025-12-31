
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sun, Play, Pause, RotateCcw, Activity, Flower, BookText, ChevronLeft, Send, Loader2, Volume2, VolumeX, Music } from 'lucide-react';

type FontSize = 'small' | 'normal' | 'large';

const getTextClasses = (size: FontSize) => {
  const mapping = {
    small: { base: 'text-sm', xl: 'text-lg', '2xl': 'text-xl', '4xl': 'text-3xl', '6xl': 'text-5xl' },
    normal: { base: 'text-base', xl: 'text-xl', '2xl': 'text-2xl', '4xl': 'text-4xl', '6xl': 'text-6xl' },
    large: { base: 'text-lg', xl: 'text-2xl', '2xl': 'text-3xl', '4xl': 'text-5xl', '6xl': 'text-7xl' }
  };
  return mapping[size];
};

// 1. 오늘의 법구
export const DailyWisdom = ({ fontSize }: { fontSize: FontSize }) => {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const text = getTextClasses(fontSize);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Generate one profound, short Buddhist teaching or quote in Korean. One or two sentences. Focus on peace of mind. No explanation, just the quote.",
        });
        if (response.text) {
          setQuote(response.text.replace(/"/g, '').trim());
        }
      } catch (e) {
        setQuote("모든 것은 마음에서 비롯되니, 오늘 하루도 평온하시길 바랍니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center fade-in bg-zen-50">
      <div className="bg-white rounded-[3rem] p-10 sm:p-14 shadow-xl border border-zen-100 max-w-sm w-full relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-zen-500"></div>
        <div className="p-4 bg-zen-50 rounded-full mb-8">
          <Sun className="w-10 h-10 text-zen-500" />
        </div>
        <h2 className={`${text.xl} font-bold text-zen-600 mb-8 tracking-widest serif-font`}>오늘의 법구</h2>
        
        {loading ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="w-8 h-8 text-zen-200 animate-spin" />
            <p className="text-zen-300 text-sm">지혜의 말씀을 구하는 중...</p>
          </div>
        ) : (
          <p className={`${text['2xl']} leading-relaxed text-zen-800 serif-font break-keep font-medium`}>
            "{quote}"
          </p>
        )}
        
        <div className="mt-12 w-12 h-0.5 bg-zen-100 rounded-full"></div>
      </div>
    </div>
  );
};

// 2. 명상 타이머
const TRACKS = [
  { id: 'thingball', name: '싱잉볼', url: 'thingball.mp3' },
  { id: 'none', name: '음악 없음', url: '' },
];

export const MeditationTimer = ({ fontSize }: { fontSize: FontSize }) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [duration, setDuration] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const text = getTextClasses(fontSize);

  // 배경음악 초기화 및 관리
  useEffect(() => {
    if (selectedTrack.url) {
      const audio = new Audio(selectedTrack.url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      bgMusicRef.current = audio;

      if (isActive) {
        audio.play().catch(e => console.warn("Audio playback failed:", e));
      }
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    }
    
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
    };
  }, [selectedTrack]);

  // 볼륨 및 뮤트 적용
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 재생/일시정지 제어
  useEffect(() => {
    const audio = bgMusicRef.current;
    if (audio) {
      if (isActive) {
        audio.play().catch(e => console.warn("Audio playback failed:", e));
      } else {
        audio.pause();
      }
    }
  }, [isActive]);

  useEffect(() => {
    let timer: number;
    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (bgMusicRef.current) bgMusicRef.current.pause();
      playBell();
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const playBell = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
    osc.start(); osc.stop(ctx.currentTime + 3);
  };

  const progress = (timeLeft / duration) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 fade-in bg-zen-50 overflow-y-auto no-scrollbar">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center mb-10 shrink-0">
        {isActive && <div className="absolute w-full h-full rounded-full bg-zen-500 breathe-effect"></div>}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="46%" stroke="#E6EBE9" strokeWidth="6" fill="white" />
          <circle cx="50%" cy="50%" r="46%" stroke="#5A7D71" strokeWidth="8" strokeLinecap="round" fill="none"
            strokeDasharray="600%" strokeDashoffset={`${600 * (1 - progress / 100)}%`} className="transition-all duration-1000 linear" />
        </svg>
        <div className={`${text['4xl']} font-light text-zen-800 z-10 tabular-nums serif-font`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-6 mb-8 shrink-0">
        <button onClick={() => setIsActive(!isActive)} className="w-16 h-16 rounded-full bg-zen-600 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all">
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>
        <button onClick={() => { setIsActive(false); setTimeLeft(duration); }} className="w-16 h-16 rounded-full bg-white text-zen-400 border border-zen-100 shadow-lg flex items-center justify-center active:scale-95 transition-all">
          <RotateCcw size={28} />
        </button>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-sm bg-white p-6 rounded-3xl shadow-sm border border-zen-100 mb-6 shrink-0">
        {/* Duration Selection */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zen-400 uppercase tracking-widest">시간</span>
          <div className="flex gap-2">
            {[5, 10, 20].map(m => (
              <button key={m} onClick={() => { setDuration(m * 60); setTimeLeft(m * 60); setIsActive(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${duration === m * 60 ? 'bg-zen-600 text-white' : 'text-zen-300 hover:bg-zen-50'}`}>
                {m}분
              </button>
            ))}
          </div>
        </div>

        {/* Track Selection */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zen-400 uppercase tracking-widest flex items-center gap-1">
            <Music size={12} /> 배경음
          </span>
          <div className="flex gap-2">
            {TRACKS.map(t => (
              <button key={t.id} onClick={() => { setSelectedTrack(t); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${selectedTrack.id === t.id ? 'bg-zen-100 text-zen-700' : 'text-zen-300 hover:bg-zen-50'}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMuted(!isMuted)} className={`text-zen-400 transition-colors ${isMuted ? 'text-red-400' : 'hover:text-zen-600'}`}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }} 
            className="flex-1 accent-zen-600 h-1.5 bg-zen-50 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {isActive && selectedTrack.url && <p className="text-zen-500 text-xs font-bold animate-pulse">평온한 {selectedTrack.name} 소리가 재생 중입니다...</p>}
    </div>
  );
};

// 3. 108배 카운터
export const BowingCounter = ({ fontSize }: { fontSize: FontSize }) => {
  const [count, setCount] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const text = getTextClasses(fontSize);

  const playMoktak = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  };

  const handleBow = () => { if (count < 108) { playMoktak(); setCount(c => c + 1); } };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 fade-in bg-zen-50">
      <h2 className={`${text.xl} font-bold text-zen-600 mb-12 tracking-widest serif-font`}>108배 정진</h2>
      <div className="relative w-64 h-64 mb-16" onClick={handleBow}>
        <div className="absolute inset-0 bg-white rounded-full shadow-2xl border-4 border-zen-100 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform z-10">
          <span className={`${text['6xl']} font-bold text-zen-800`}>{count}</span>
          <span className="text-zen-300 font-bold mt-2">/ 108</span>
        </div>
        <svg className="absolute inset-0 transform -rotate-90 scale-105">
          <circle cx="50%" cy="50%" r="48%" stroke="#5A7D71" strokeWidth="8" fill="none"
            strokeDasharray="300%" strokeDashoffset={`${300 * (1 - count / 108)}%`} strokeLinecap="round" className="transition-all duration-300" />
        </svg>
      </div>
      <button onClick={handleBow} className="w-full max-w-xs py-5 bg-zen-600 text-white rounded-[2rem] text-xl font-bold shadow-xl active:scale-95 transition-transform">
        {count >= 108 ? '오늘의 정진 완료' : '1배 올리기'}
      </button>
      <button onClick={() => window.confirm('카운트를 초기화하시겠습니까?') && setCount(0)} className="mt-10 text-zen-300 font-bold flex items-center gap-2 hover:text-zen-500 transition-colors">
        <RotateCcw size={18} /> 초기화
      </button>
    </div>
  );
};

// 4. 경전 읽기
const SCRIPTURES = [
  { id: 'heart', title: '마하반야바라밀다심경', content: `관자재보살 행심반야바라밀다시 조견오온개공 도일체고액\n사리자 색불이공 공불이색 색즉시공 공즉시색 수상행식 역부여시\n사리자 시제법공상 불생불멸 불구부정 부증불감\n시고 공중무색 무수상행식 무안이비설신의 무색성향미촉법\n무안계 내지 무의식계 무무명 역무무명진 내지 무노사 역무노사진\n무고집멸도 무지 역무득 이무소득고\n보리살타 의반야바라밀다고 심무가애 무가애고 무유공포 원리전도몽상 구경열반\n삼세제불 의반야바라밀다고 득아뇩다라삼먁삼보리\n고지 반야바라밀다 시대신주 시대명주 시무상주 시무등등주\n능제일체고 진실불허 고설반야바라밀다주 즉설주왈\n\n아제아제 바라아제 바라승아제 모지 사바하\n아제아제 바라아제 바라승아제 모지 사바하\n아제아제 바라아제 바라승아제 모지 사바하` },
  { id: 'thousand', title: '천수경 (개경게)', content: `무상심심미묘법 백천만겁난조우\n아금문견득수지 원해여래진실의\n\n정구업진언\n수리수리 마하수리 수수리 사바하 (3번)\n\n오방내외안위제신진언\n나모 사만다 못다남 옴 도로도로 지미 사바하 (3번)\n\n개법장진언\n옴 아라남 아라다 (3번)` }
];

export const ScriptureReader = ({ fontSize }: { fontSize: FontSize }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const text = getTextClasses(fontSize);

  if (selected) {
    const s = SCRIPTURES.find(x => x.id === selected);
    return (
      <div className="flex flex-col h-full bg-white p-6 fade-in">
        <button onClick={() => setSelected(null)} className="flex items-center text-zen-500 mb-8 font-bold hover:text-zen-700 transition-colors">
          <ChevronLeft size={24} /> 뒤로가기
        </button>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
          <h2 className={`${text.xl} font-bold text-zen-800 mb-10 serif-font text-center border-b border-zen-50 pb-6`}>{s?.title}</h2>
          <div className={`${text.base} scripture-content text-zen-900 serif-font whitespace-pre-wrap px-2`}>
            {s?.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col items-center bg-zen-50">
      <h2 className={`${text.xl} font-bold text-zen-600 mb-12 tracking-widest serif-font`}>불교 경전</h2>
      <div className="w-full space-y-6 max-w-md">
        {SCRIPTURES.map(s => (
          <button key={s.id} onClick={() => setSelected(s.id)} className="w-full p-8 bg-white border border-zen-100 rounded-[2rem] shadow-sm flex justify-between items-center group active:scale-[0.98] transition-all">
            <span className={`${text.base} font-bold text-zen-800 serif-font`}>{s.title}</span>
            <BookText className="text-zen-200 group-hover:text-zen-500 transition-colors" size={24} />
          </button>
        ))}
      </div>
    </div>
  );
};

// 5. 마음 상담소 (Chat)
export const SpiritualCounseling = ({ fontSize }: { fontSize: FontSize }) => {
  const [msgs, setMsgs] = useState([{ role: 'model', text: '어서 오세요. 마음속의 무거운 짐이 있다면 무엇이든 말씀해 주세요. 부처님의 가르침으로 함께 길을 찾아보겠습니다.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const text = getTextClasses(fontSize);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input; setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMsg,
        config: { systemInstruction: "당신은 자비롭고 지혜로운 불교의 큰스님입니다. 사용자의 고민을 경청하고, 따뜻한 위로와 함께 불교적 가르침(자비, 인연, 마음챙김 등)을 바탕으로 정중하고 자애롭게 상담해 주세요. 하대하지 마시고 정중한 말투를 유지하세요." }
      });
      setMsgs(prev => [...prev, { role: 'model', text: response.text || '말씀을 듣는 중에 잠시 명상에 잠겼습니다.' }]);
    } catch (e) {
      setMsgs(prev => [...prev, { role: 'model', text: '지금은 상담이 잠시 어렵습니다. 잠시 후에 다시 말씀해 주세요.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-zen-50/50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[1.5rem] shadow-sm ${m.role === 'user' ? 'bg-zen-600 text-white rounded-tr-none' : 'bg-white text-zen-900 border border-zen-100 rounded-tl-none'}`}>
              <p className={`${text.base} leading-relaxed font-medium`}>{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-zen-400 text-xs px-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            스님께서 답변을 생각하고 계십니다...
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>
      <div className="p-4 bg-white border-t border-zen-50 pb-24">
        <div className="flex items-center gap-3 bg-zen-50 rounded-[2rem] p-2 pr-2 border border-zen-100 focus-within:border-zen-400 focus-within:ring-1 focus-within:ring-zen-400 transition-all">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="고민을 여기에 적어보세요..." className="flex-1 bg-transparent px-5 py-2.5 outline-none text-sm font-medium" />
          <button onClick={send} disabled={!input.trim() || loading} className="p-3 bg-zen-600 text-white rounded-full disabled:bg-zen-100 disabled:text-zen-300 transition-all active:scale-90 shadow-md">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
