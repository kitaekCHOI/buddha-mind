import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { BookOpen, MessageCircle, Play, Pause, RotateCcw, Sparkles, Send, Flower, Activity, Type, Sun, BookText, ChevronLeft, Key, Volume2, Volume1, Loader2, Mic, MicOff, Music } from 'lucide-react';

// Configuration
const MODEL_NAME = 'gemini-3-flash-preview';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';
// Example Meditation Music URL (Royalty Free)
const MEDITATION_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=zen-meditation-113829.mp3";

// Helper to safely get AI instance
const getAIClient = () => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    return null;
  }
};

// --- Audio Helpers for TTS ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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
  const [now, setNow] = useState<Date>(new Date());
  const text = getTextClasses(fontSize);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    const fetchQuote = async () => {
      try {
        const ai = getAIClient();
        if (!ai) {
          // If no AI, fallback to a default quote
          setQuote("마음의 평화는 당신 안에 있습니다. (연결 대기 중)");
          setLoading(false);
          return;
        }
        
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: "Generate a short, profound, and soothing Buddhist quote or teaching in Korean. It should be one or two sentences long. Do not add explanations, just the quote and the source if applicable.",
        });
        setQuote(response.text || "마음의 평화는 당신 안에 있습니다.");
      } catch (error) {
        console.error(error);
        setQuote("지나간 일은 지나간 대로, 다가올 일은 다가올 대로 두십시오. 지금 이 순간에 머무르십시오.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekDay = weekDays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}시 ${minutes}분`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center fade-in bg-gradient-to-b from-zen-50 to-white">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-zen-100 max-w-sm w-full transform transition-all hover:scale-[1.02] duration-500 z-10">
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

      <div className="flex flex-col items-center mt-16 space-y-2">
           <span className={`${text['2xl']} text-black font-serif`}>{formatDate(now)}</span>
           <span className={`${text['2xl']} text-zen-600 font-serif font-medium`}>{formatTime(now)}</span>
      </div>
    </div>
  );
};

// 2. Meditation Timer Component
const MeditationTimer = ({ fontSize }: { fontSize: FontSize }) => {
  const [duration, setDuration] = useState<number>(5 * 60); 
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5); // Default volume 50%
  
  const intervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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

  // Initialize Music Audio Element
  useEffect(() => {
    audioRef.current = new Audio(MEDITATION_MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  // Control Music Playback
  useEffect(() => {
      if (!audioRef.current) return;

      if (isActive && isMusicEnabled) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
          audioRef.current.pause();
      }
  }, [isActive, isMusicEnabled]);

  // Control Volume
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = volume;
      }
  }, [volume]);

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

  // Timer Interval Effect
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
    <div className="flex flex-col items-center justify-center h-full p-6 fade-in relative">
      <h2 className={`${text.xl} font-semibold text-zen-600 mb-8 tracking-widest serif-font`}>명상</h2>
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
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

      <div className="flex flex-col items-center gap-6 mb-8 w-full max-w-xs">
        <div className="flex items-center gap-6">
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
            <button 
            onClick={() => setIsMusicEnabled(!isMusicEnabled)}
            className={`w-12 h-12 rounded-full border transition-all shadow-sm flex items-center justify-center ${isMusicEnabled ? 'bg-zen-100 text-zen-600 border-zen-200' : 'bg-white text-gray-300 border-gray-100'}`}
            title="배경 음악 토글"
            >
            <Music size={20} />
            </button>
        </div>

        {/* Volume Slider - Only visible when music is enabled */}
        {isMusicEnabled && (
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-zen-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Volume1 size={18} className="text-zen-400" />
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-zen-100 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-zen-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm hover:[&::-webkit-slider-thumb]:bg-zen-600 transition-all"
                />
                <Volume2 size={18} className="text-zen-400" />
            </div>
        )}
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const text = getTextClasses(fontSize);

  if (selectedId) {
    const scripture = SCRIPTURES.find(s => s.id === selectedId);
    if (!scripture) return null;

    return (
      <div className="flex flex-col h-full p-6 fade-in bg-white/50">
         <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedId(null)}
              className="p-2 -ml-2 text-gray-500 hover:text-zen-600 hover:bg-zen-50 rounded-full transition-all"
            >
              <ChevronLeft size={28} />
            </button>
            <h2 className={`${text.xl} font-bold text-zen-800 ml-2 serif-font truncate`}>{scripture.title}</h2>
         </div>
         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-24">
            <div className={`${text.lg} leading-loose text-gray-700 whitespace-pre-wrap serif-font p-1`}>
              {scripture.content}
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 fade-in">
      <h2 className={`${text.xl} font-semibold text-zen-600 mb-8 tracking-widest serif-font text-center`}>불교 경전</h2>
      <div className="space-y-4 overflow-y-auto pb-24 custom-scrollbar">
        {SCRIPTURES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className="w-full text-left p-6 bg-white rounded-2xl border border-zen-100 shadow-sm hover:shadow-md hover:border-zen-300 transition-all group flex justify-between items-center"
          >
             <span className={`${text.lg} font-medium text-zen-800 group-hover:text-zen-600 serif-font`}>{s.title}</span>
             <BookText size={20} className="text-zen-200 group-hover:text-zen-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

// 5. ChatBot Component
const ChatBot = ({ fontSize }: { fontSize: FontSize }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '반갑습니다. 마음의 고민이 있다면 편안하게 이야기해 주세요.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const text = getTextClasses(fontSize);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = () => {
      const ai = getAIClient();
      if (!ai) return null;
      return ai.chats.create({
          model: MODEL_NAME,
          config: {
              systemInstruction: "당신은 자비롭고 지혜로운 불교 승려입니다. 사용자의 고민을 듣고 불교적 가르침과 따뜻한 위로를 건네주세요. 답변은 한국어로 정중하고 온화하게 하십시오.",
          }
      });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
          chatRef.current = initChat();
      }
      
      if (!chatRef.current) {
           setTimeout(() => {
               setMessages(prev => [...prev, { role: 'model', text: 'API 키가 설정되지 않아 대화를 진행할 수 없습니다.' }]);
               setIsLoading(false);
           }, 500);
           return;
      }

      const result = await chatRef.current.sendMessage({ message: userText });
      const responseText = result.text;
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: '죄송합니다. 잠시 후 다시 말씀해 주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zen-50/30">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-zen-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 shadow-sm border border-zen-100 rounded-tl-none'
            }`}>
              <p className={`${text.base} leading-relaxed whitespace-pre-wrap`}>{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-zen-100 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-zen-500" />
                <span className="text-sm text-gray-400">생각 중...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-zen-100 safe-area-bottom pb-20">
         <div className="flex items-center gap-2 bg-zen-50 p-2 rounded-full border border-zen-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="고민을 나누어 보세요..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-zen-600 text-white rounded-full hover:bg-zen-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
               <Send size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};

// 6. Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [showSettings, setShowSettings] = useState(false);

  // Tab Content Rendering
  const renderContent = () => {
    switch (activeTab) {
      case 'daily': return <DailyWisdom fontSize={fontSize} />;
      case 'meditation': return <MeditationTimer fontSize={fontSize} />;
      case 'bowing': return <BowingCounter fontSize={fontSize} />;
      case 'scripture': return <ScriptureReader fontSize={fontSize} />;
      case 'chat': return <ChatBot fontSize={fontSize} />;
      default: return <DailyWisdom fontSize={fontSize} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800 font-sans overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-zen-100 bg-white z-10">
            <h1 className="text-xl font-bold text-zen-800 flex items-center gap-2 serif-font">
                <Flower className="text-zen-500" />
                마음의 등불
            </h1>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-500 hover:text-zen-600 transition-colors">
                <Type size={24} />
            </button>
        </header>
        
        {/* Settings Dropdown */}
        {showSettings && (
            <div className="absolute top-16 right-4 bg-white p-4 rounded-2xl shadow-xl border border-zen-100 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-sm font-medium text-gray-500 mb-3">글자 크기</div>
                <div className="flex gap-2">
                    {(['small', 'normal', 'large'] as FontSize[]).map(size => (
                        <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`px-3 py-1.5 rounded-lg text-sm border ${fontSize === size ? 'bg-zen-100 border-zen-300 text-zen-800' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                            {size === 'small' ? '작게' : size === 'normal' ? '보통' : '크게'}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative bg-zen-50/30">
            {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-zen-100 safe-area-bottom">
            <div className="flex justify-around items-center h-16">
                <button onClick={() => setActiveTab('daily')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'daily' ? 'text-zen-600' : 'text-gray-400'}`}>
                    <Sun size={24} strokeWidth={activeTab === 'daily' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">법구</span>
                </button>
                <button onClick={() => setActiveTab('meditation')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'meditation' ? 'text-zen-600' : 'text-gray-400'}`}>
                    <Activity size={24} strokeWidth={activeTab === 'meditation' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">명상</span>
                </button>
                <button onClick={() => setActiveTab('bowing')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'bowing' ? 'text-zen-600' : 'text-gray-400'}`}>
                    <div className="relative">
                       <Flower size={24} strokeWidth={activeTab === 'bowing' ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-medium">108배</span>
                </button>
                <button onClick={() => setActiveTab('scripture')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'scripture' ? 'text-zen-600' : 'text-gray-400'}`}>
                    <BookOpen size={24} strokeWidth={activeTab === 'scripture' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">경전</span>
                </button>
                <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'chat' ? 'text-zen-600' : 'text-gray-400'}`}>
                    <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">스님</span>
                </button>
            </div>
        </nav>
    </div>
  );
};

export default App;