import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Scroll } from 'lucide-react';
import { SUTRAS } from '../constants';
import { Sutra } from '../types';

const SutraList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSutra = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-xl font-serif text-stone-700 mb-6 pl-2 border-l-4 border-monk-500">
        독경 (讀經)
      </h2>
      
      {SUTRAS.map((sutra: Sutra) => (
        <div 
          key={sutra.id}
          className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden transition-all duration-300"
        >
          <button
            onClick={() => toggleSutra(sutra.id)}
            className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-temple-100 rounded-lg text-monk-700">
                <Scroll size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-800 text-lg">{sutra.title}</h3>
                <p className="text-xs text-stone-500 mt-1">{sutra.shortDescription}</p>
              </div>
            </div>
            {expandedId === sutra.id ? (
              <ChevronUp className="text-stone-400" />
            ) : (
              <ChevronDown className="text-stone-400" />
            )}
          </button>

          {expandedId === sutra.id && (
            <div className="px-6 pb-6 pt-2 bg-stone-50/50">
              <div className="w-full h-px bg-stone-200 mb-4" />
              <div className="prose prose-stone prose-sm max-w-none font-serif leading-loose text-stone-700 whitespace-pre-wrap">
                {sutra.content}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SutraList;