import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Scroll, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { SUTRAS } from '../constants';
import { Sutra } from '../types';

const SutraList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Audio State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleSutra = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = (e: React.MouseEvent, sutra: Sutra) => {
    e.stopPropagation(); // Prevent toggling the accordion

    if (!sutra.audioSrc) return;

    if (playingId === sutra.id) {
      // Toggle Pause
      if (audioRef.current) {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          setPlayingId(null); // Optimistic UI update, technically just paused but we treat as stopped for icon simplicity
        } else {
          audioRef.current.play();
          setPlayingId(sutra.id);
        }
      }
    } else {
      // Start New
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const newAudio = new Audio(sutra.audioSrc);
      
      // Handle playback end
      newAudio.onended = () => {
        setPlayingId(null);
      };

      // Handle errors (e.g., file not found)
      newAudio.onerror = () => {
        console.warn(`Audio not found for ${sutra.id}`);
        setPlayingId(null);
        alert("오디오 파일을 재생할 수 없습니다.");
      };

      audioRef.current = newAudio;
      audioRef.current.play().catch(err => {
        console.error("Playback failed", err);
        setPlayingId(null);
      });
      setPlayingId(sutra.id);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-xl font-serif text-stone-700 mb-6 pl-2 border-l-4 border-monk-500">
        독경 (讀經)
      </h2>
      
      {SUTRAS.map((sutra: Sutra) => {
        const isPlaying = playingId === sutra.id;
        const hasAudio = !!sutra.audioSrc;

        return (
          <div 
            key={sutra.id}
            className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
              isPlaying ? 'border-monk-500 ring-1 ring-monk-500/20' : 'border-stone-100'
            }`}
          >
            <div className="flex items-center justify-between p-4">
              {/* Main Clickable Area for Accordion */}
              <button
                onClick={() => toggleSutra(sutra.id)}
                className="flex-1 flex items-center text-left"
              >
                <div className={`p-2 rounded-lg mr-4 transition-colors ${isPlaying ? 'bg-monk-100 text-monk-600' : 'bg-temple-100 text-monk-700'}`}>
                  <Scroll size={20} />
                </div>
                <div>
                  <h3 className={`font-serif font-bold text-lg ${isPlaying ? 'text-monk-700' : 'text-stone-800'}`}>
                    {sutra.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">{sutra.shortDescription}</p>
                </div>
              </button>

              {/* Controls */}
              <div className="flex items-center space-x-3">
                {/* Audio Button */}
                {hasAudio && (
                  <button
                    onClick={(e) => handlePlayAudio(e, sutra)}
                    className={`p-2 rounded-full transition-all ${
                      isPlaying 
                        ? 'bg-monk-500 text-white shadow-md' 
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                    aria-label={isPlaying ? "Pause Chant" : "Play Chant"}
                  >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                  </button>
                )}
                
                {/* Expand Toggle */}
                <button 
                  onClick={() => toggleSutra(sutra.id)}
                  className="p-1 text-stone-400 hover:text-stone-600"
                >
                  {expandedId === sutra.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === sutra.id && (
              <div className="px-6 pb-6 pt-2 bg-stone-50/50">
                <div className="w-full h-px bg-stone-200 mb-4" />
                
                {/* Visual Indicator if playing */}
                {isPlaying && (
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-white rounded-lg border border-monk-100 text-monk-600 text-xs font-medium animate-pulse">
                    <Volume2 size={14} />
                    <span>독경 중입니다...</span>
                  </div>
                )}

                <div className="prose prose-stone prose-sm max-w-none font-serif leading-loose text-stone-700 whitespace-pre-wrap">
                  {sutra.content}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SutraList;