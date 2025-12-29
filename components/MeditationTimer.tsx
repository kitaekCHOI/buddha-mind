import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Volume1, VolumeX } from 'lucide-react';
import { playBellSound, setMasterVolume } from '../services/audio';

const PRESETS = [5, 10, 15, 30];

const MeditationTimer: React.FC = () => {
  const [duration, setDuration] = useState<number>(10); // minutes
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [volume, setVolume] = useState<number>(50);

  // Use ref to keep track of interval ID for cleanup
  const timerRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [duration]);

  const toggleTimer = () => {
    if (!isActive) {
      // Start
      playBellSound();
      setIsActive(true);
    } else {
      // Pause
      setIsActive(false);
    }
  };

  const handleDurationChange = (min: number) => {
    setDuration(min);
    setIsActive(false);
    setTimeLeft(min * 60);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    setMasterVolume(newVolume / 100);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} className="text-stone-400" />;
    if (volume < 50) return <Volume1 size={20} className="text-stone-400" />;
    return <Volume2 size={20} className="text-stone-400" />;
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      playBellSound();
      setIsActive(false);
      setSessionCount(prev => prev + 1);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Calculate circle progress
  const totalSeconds = duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const strokeDasharray = 283; // 2 * PI * 45 (radius)
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-2xl font-serif text-stone-700">명상의 시간</h2>
        <p className="text-stone-500 text-sm">호흡에 집중하며 마음을 비우세요.</p>
      </div>

      {/* Timer Visual */}
      <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-stone-200 fill-none"
            strokeWidth="8"
          />
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="stroke-monk-500 fill-none transition-[stroke-dashoffset] duration-1000 ease-linear"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light text-stone-700 font-serif tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-stone-400 mt-2 uppercase tracking-widest">
            {isActive ? '수행 중' : '준비'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6 mb-8">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
          aria-label="Reset"
        >
          <RotateCcw size={24} />
        </button>

        <button 
          onClick={toggleTimer}
          className={`p-6 rounded-full transition-all transform hover:scale-105 shadow-xl ${
            isActive 
              ? 'bg-stone-700 text-stone-100 hover:bg-stone-600' 
              : 'bg-monk-500 text-white hover:bg-monk-700'
          }`}
          aria-label={isActive ? "Pause" : "Start"}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        {/* Volume Control Button (triggers sound test only) */}
        <button 
          onClick={playBellSound}
          className="p-4 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
          aria-label="Test Bell"
        >
          <Volume2 size={24} />
        </button>
      </div>

      {/* Volume Slider */}
      <div className="w-full max-w-xs px-8 mb-10">
        <div className="flex items-center space-x-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
          <button 
            onClick={() => {
              const newVol = volume === 0 ? 50 : 0;
              setVolume(newVol);
              setMasterVolume(newVol / 100);
            }}
            className="focus:outline-none"
          >
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-monk-500 hover:accent-monk-600 focus:outline-none focus:ring-2 focus:ring-monk-500/20"
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-sm">
        {PRESETS.map((min) => (
          <button
            key={min}
            onClick={() => handleDurationChange(min)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              duration === min
                ? 'bg-stone-300 text-stone-800'
                : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
            }`}
          >
            {min}분
          </button>
        ))}
      </div>

      {sessionCount > 0 && !isActive && (
        <div className="mt-8 text-sm text-stone-500">
          오늘 완료한 명상: {sessionCount}회
        </div>
      )}
    </div>
  );
};

export default MeditationTimer;