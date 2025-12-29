import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { BookOpen, MessageCircle, Play, Pause, RotateCcw, Sparkles, Send, Flower, Activity, Type, Sun, BookText, ChevronLeft } from 'lucide-react';

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

// --- Data: Buddhist Scriptures ---
const SCRIPTURES = [
  {
    id: 'cheonsu',
    title: '천수경 (개경)',
    content: `정구업진언\n수리수리 마하수리 수수리 사바하\n수리수리 마하수리 수수리 사바하\n수리수리 마하수리 수수리 사바하\n\n오방내외안위제신진언\n나무 사만다 못다남 옴 도로도로 지미 사바하\n나무 사만다 못다남 옴 도로도로 지미 사바하\n나무 사만다 못다남 옴 도로도로 지미 사바하\n\n개경게\n무상심심미묘법 백천만겁난조우\n아금문견득수지 원해여래진실의\n\n개법장진언\n옴 아라남 아라다\n옴 아라남 아라다\n옴 아라남 아라다\n\n천수천안 관자재보살 광대원만 무애대비심 대다라니 계청\n계수관음대비주 원력홍심상호신\n천비장엄보호지 천안광명변관조\n진실어중선밀어 무위심내기비심\n속령만족제희구 영사멸제제죄업\n천룡중성동자호 백천삼매돈훈수\n수지신시광명당 수지심시신통장\n세척진노원제해 초증보리방편문\n아금칭송서귀의 소원종심실원만\n\n나무대비관세음 원아속지일체법\n나무대비관세음 원아조득지혜안\n나무대비관세음 원아속도일체중\n나무대비관세음 원아조득선방편\n나무대비관세음 원아속승반야선\n나무대비관세음 원아조득월고해\n나무대비관세음 원아속득계정도\n나무대비관세음 원아조등원적산\n나무대비관세음 원아속회무위사\n나무대비관세음 원아조동법성신\n\n아약향도산 도산자최절\n아약향화탕 화탕자소멸\n아약향지옥 지옥자고갈\n아약향아귀 아귀자포만\n아약향수라 악심자조복\n아약향축생 자득대지혜\n\n(이하 신묘장구대다라니로 이어짐)`
  },
  {
    id: 'dharani',
    title: '신묘장구대다라니',
    content: `나모라 다나다라 야야 나막알약 바로기제 새바라야\n모지사다바야 마하사다바야 마하가로 니가야\n옴 살바 바예수 다라나 가라야 다사명 나막까리다바\n이맘알야 바로기제 새바라 다바 니라간타 나막하리나야\n마발다 이사미 살발타 사다남 수반 아예염\n살바다나 바바말아 미수다감 다냐타\n옴 아로계 아로가 마지로가 지가란제 혜혜하례\n마하모지 사다바 사마라 사마라 하리나야\n구로구로 갈마 사다야 사다야 도로도로 미연제\n마하미연제 다라다라 다린나례 새바라 자라자라\n마라 미마라 아마라 몰제 예혜혜\n로계 새바라 라아 미사미 나사야 나베 사미사미\n나사야 모하자라 미사미 나사야 호로호로 마라호로\n하례 바나마 나바 사라사라 시리시리 소로소로\n못자못자 모다야 모다야 매다리야 니라간타\n가마사 날사남 바라 하라나야 마낙 사바하\n싯다야 사바하 마하싯다야 사바하\n싯다유예 새바라야 사바하 니라간타야 사바하\n바라하 목카싱하 목카야 사바하 바나마 하따야 사바하\n자가라 욕다야 사바하 상카섭나녜 모다나야 사바하\n마하라 구타다라야 사바하 바마사간타 이사시체다\n가릿나 이나야 사바하 먀가라 잘마이바 사나야 사바하\n\n나모라 다나다라 야야 나막알약 바로기제 새바라야 사바하\n나모라 다나다라 야야 나막알약 바로기제 새바라야 사바하\n나모라 다나다라 야야 나막알약 바로기제 새바라야 사바하`
  },
  {
    id: 'heart',
    title: '반야심경',
    content: `마하반야바라밀다심경\n\n관자재보살 행심반야바라밀다시 조견오온개공 도일체고액\n사리자 색불이공 공불이색 색즉시공 공즉시색 수상행식 역부여시\n사리자 시제법공상 불생불멸 불구부정 부증불감\n시고 공중무색 무수상행식 무안이비설신의 무색성향미촉법\n무안계 내지 무의식계 무무명 역무무명진 내지 무노사 역무노사진\n무고집멸도 무지 역무득 이무소득고\n보리살타 의반야바라밀다고 심무가애 무가애고 무유공포 원리전도몽상 구경열반\n삼세제불 의반야바라밀다고 득아뇩다라삼먁삼보리\n고지 반야바라밀다 시대신주 시대명주 시무상주 시무등등주\n능제일체고 진실불허 고설반야바라밀다주 즉설주왈\n\n아제아제 바라아제 바라승아제 모지 사바하\n아제아제 바라아제 바라승아제 모지 사바하\n아제아제 바라아제 바라승아제 모지 사바하`
  },
  {
    id: 'beopseong',
    title: '법성게',
    content: `법성원융무이상 제법부동본래적\n무명무상절일체 증지소지비여경\n진성심심극미묘 불수자성수연성\n일중일체다중일 일즉일체다즉일\n일미진중함시방 일체진중역여시\n무량원겁즉일념 일념즉시무량겁\n구세십세호상즉 잉불잡란격별성\n초발심시변정각 생사열반상공화\n이사명연무분별 십불보현대인경\n능인해인삼매중 번출여의부사의\n우보익생만허공 중생수기득이익\n시고행자환본제 파식망상필부득\n무연선교착여의 귀가수분득자량\n이다라니무진보 장엄법계실보전\n궁좌실제중도상 구래부동명위불`
  },
  {
    id: 'diamond',
    title: '금강경 (제1분)',
    content: `제1분 법회인유분\n\n이와 같이 내가 들었다.\n어느 때 부처님께서 사위국 기수급고독원에서 큰 비구들 천이백오십 인과 함께 계시었다.\n그 때 세존께서는 식사 때가 되어 가사를 입으시고 발우를 가지시고 사위성에 들어가시어 차례로 밥을 비시었다.\n본래의 처소로 돌아와 진지를 잡수시고 가사와 발우를 거두시고 발을 씻으신 뒤 자리를 펴고 앉으셨다.\n\n제2분 선현기청분\n\n그 때 장로 수보리가 대중 가운데 있다가 곧 자리에서 일어나 옷깃을 바로 하고 오른쪽 무릎을 땅에 꿇으며 합장하고 부처님께 공경히 여쭈었다.\n"희유하십니다, 세존이시여.\n여래께서는 모든 보살들을 잘 호념하시고 모든 보살들에게 잘 부촉하십니다.\n세존이시여, 선남자 선여인이 아뇩다라삼먁삼보리심을 발하고는 마땅히 어떻게 머물며 어떻게 그 마음을 항복받아야 합니까?"\n부처님께서 말씀하시었다.\n"훌륭하고 훌륭하다, 수보리여.\n그대 말과 같이 여래는 모든 보살을 잘 호념하고 모든 보살에게 잘 부촉하느니라.\n너는 이제 자세히 들으라. 마땅히 너를 위하여 설하리라.\n선남자 선여인이 아뇩다라삼먁삼보리심을 발하고는 마땅히 이와 같이 머물며 이와 같이 그 마음을 항복받을지니라."\n"예, 그렇습니다. 세존이시여. 즐거이 듣고자 하나이다."\n\n(이하 생략)`
  }
];

// --- Types ---
type Tab = 'daily' | 'meditation' | 'bowing' | 'scripture' | 'chat';
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
             <Sun className="w-8 h-8 text-zen-500" />
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

// 4. Scripture Reader Component
const ScriptureReader = ({ fontSize }: { fontSize: FontSize }) => {
  const [selectedScriptureId, setSelectedScriptureId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const text = getTextClasses(fontSize);

  const selectedScripture = SCRIPTURES.find(s => s.id === selectedScriptureId);

  // Reset scroll to top when scripture opens
  useEffect(() => {
    if (selectedScriptureId && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedScriptureId]);

  // Auto-scroll logic: 1 line per second (approx 40px/s for readability)
  useEffect(() => {
    if (isPlaying && selectedScriptureId) {
      intervalRef.current = window.setInterval(() => {
        if (scrollContainerRef.current) {
          // Smooth scroll by a small amount often, or 1 line (e.g., 36px) every 1000ms.
          // The request said "1초에 한줄씩".
          // We assume a line height roughly. Let's scroll 40px smoothly.
          scrollContainerRef.current.scrollBy({ top: 40, behavior: 'smooth' });
          
          // Check if reached bottom to stop? Optional.
          const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
          if (scrollTop + clientHeight >= scrollHeight - 10) {
            setIsPlaying(false);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, selectedScriptureId]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  if (selectedScripture) {
    return (
      <div className="flex flex-col h-full bg-zen-50 fade-in relative">
        {/* Header for Reader */}
        <div className="flex items-center p-4 border-b border-zen-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <button 
            onClick={() => {
              setIsPlaying(false);
              setSelectedScriptureId(null);
            }}
            className="p-2 -ml-2 rounded-full hover:bg-zen-100 text-zen-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className={`${text.lg} font-bold text-zen-800 ml-2 serif-font flex-1`}>{selectedScripture.title}</h2>
          <button
            onClick={togglePlay}
            className={`p-2 rounded-full transition-colors ${isPlaying ? 'text-terracotta-500 bg-orange-50' : 'text-zen-600 hover:bg-zen-100'}`}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>

        {/* Text Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 no-scrollbar"
        >
          <div className="max-w-xl mx-auto pb-32"> {/* Extra padding at bottom for scrolling */}
            <p className={`${text['2xl']} leading-loose text-zen-800 font-serif whitespace-pre-wrap text-center`}>
              {selectedScripture.content}
            </p>
          </div>
        </div>
        
        {/* Floating Controls (Optional overlay) */}
        {!isPlaying && (
           <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 fade-in">
             <button
               onClick={togglePlay}
               className="flex items-center gap-2 px-6 py-3 bg-zen-700 text-white rounded-full shadow-lg hover:bg-zen-800 transition-all active:scale-95"
             >
               <Play size={18} fill="currentColor" />
               <span className="text-sm font-medium">자동 읽기 시작</span>
             </button>
           </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="flex flex-col h-full p-4 fade-in overflow-y-auto">
      <div className="flex flex-col items-center mb-4">
        <div className="w-12 h-12 bg-zen-100 rounded-full flex items-center justify-center mb-2 text-zen-600">
           <BookText size={24} />
        </div>
        <h2 className={`${text.xl} font-semibold text-zen-600 tracking-widest serif-font`}>불경 공부</h2>
        <p className={`${text.sm} text-gray-400 mt-1`}>마음을 맑게 하는 경전</p>
      </div>

      <div className="grid gap-3 max-w-sm mx-auto w-full pb-20">
        {SCRIPTURES.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedScriptureId(item.id)}
            className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-zen-100 hover:border-zen-300 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-zen-50 text-zen-500 flex items-center justify-center mr-4 group-hover:bg-zen-500 group-hover:text-white transition-colors">
              <BookOpen size={20} />
            </div>
            <div className="flex-1">
              <h3 className={`${text.lg} font-bold text-zen-800 group-hover:text-zen-600 transition-colors serif-font`}>{item.title}</h3>
            </div>
            <div className="text-gray-300 group-hover:text-zen-400">
              <ChevronLeft size={20} className="transform rotate-180" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 5. AI Monk Counseling Component
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
        {activeTab === 'scripture' && <ScriptureReader fontSize={fontSize} />}
        {activeTab === 'bowing' && <BowingCounter fontSize={fontSize} />}
        {activeTab === 'chat' && <MonkChat fontSize={fontSize} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t border-zen-100 flex justify-around items-center px-2 pb-safe flex-shrink-0 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)] z-20">
        <NavButton 
          active={activeTab === 'daily'} 
          onClick={() => setActiveTab('daily')} 
          icon={<Sun size={24} />} 
          label="법구" 
        />
        <NavButton 
          active={activeTab === 'meditation'} 
          onClick={() => setActiveTab('meditation')} 
          icon={<Sparkles size={24} />} 
          label="명상" 
        />
        <NavButton 
          active={activeTab === 'scripture'} 
          onClick={() => setActiveTab('scripture')} 
          icon={<BookText size={24} />} 
          label="불경" 
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
    className={`flex flex-col items-center justify-center flex-1 h-16 rounded-2xl transition-all duration-300 ${
        active 
        ? 'text-zen-700 -translate-y-1' 
        : 'text-gray-400 hover:text-zen-500'
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-zen-100' : 'bg-transparent'}`}>
        {React.cloneElement(icon, { 
            className: active ? 'fill-zen-500/20 stroke-zen-600' : 'stroke-current',
            strokeWidth: active ? 2.5 : 2 
        } as any)}
    </div>
    <span className={`text-[10px] mt-0.5 font-medium ${active ? 'opacity-100' : 'opacity-70'}`}>
        {label}
    </span>
  </button>
);