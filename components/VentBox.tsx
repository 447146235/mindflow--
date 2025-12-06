import React, { useState } from 'react';
import { Trash2, Sparkles, Loader2 } from 'lucide-react';
import { getComfortingResponse } from '../services/geminiService';

const VentBox: React.FC = () => {
  const [text, setText] = useState('');
  const [state, setState] = useState<'IDLE' | 'CRUSHING' | 'PROCESSING' | 'RESOLVED'>('IDLE');
  const [wisdom, setWisdom] = useState('');

  const handleVent = async () => {
    if (!text.trim()) return;
    
    // Start visual destruction
    setState('CRUSHING');
    
    // Fetch AI response in background
    const responsePromise = getComfortingResponse(text);

    // Allow animation to play out (0.8s)
    setTimeout(async () => {
        setState('PROCESSING');
        const response = await responsePromise;
        
        // Brief pause for "Processing" feeling
        setTimeout(() => {
            setWisdom(response);
            setText(''); 
            setState('RESOLVED');
        }, 800);
    }, 800);
  };

  const reset = () => {
    setState('IDLE');
    setWisdom('');
    setText('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 max-w-md mx-auto relative overflow-hidden">
      
      {/* Header */}
      <div className={`text-center mb-6 transition-opacity duration-500 ${state === 'CRUSHING' ? 'opacity-0' : 'opacity-100'}`}>
        <h2 className="text-2xl font-light text-rose-400">烦恼粉碎机</h2>
        <p className="text-slate-400 text-sm mt-1">
            {state === 'IDLE' && "写下你的烦恼，然后彻底粉碎它。"}
            {state === 'PROCESSING' && "正在净化情绪..."}
            {state === 'RESOLVED' && "此刻，内心已重归平静。"}
        </p>
      </div>

      {/* Input Area / Crushing Animation */}
      {(state === 'IDLE' || state === 'CRUSHING') && (
        <div className={`w-full ${state === 'CRUSHING' ? 'animate-shred origin-center' : 'animate-fade-in'}`}>
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="最近有什么让你感到焦虑或不开心？..."
              disabled={state === 'CRUSHING'}
              className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all resize-none shadow-inner"
            />
            {/* Visual paper texture hint */}
            <div className="absolute top-0 right-0 p-2 pointer-events-none opacity-20">
                <div className="w-4 h-4 border-t border-r border-white rounded-tr-sm"></div>
            </div>
          </div>

          <button
            onClick={handleVent}
            disabled={!text.trim() || state === 'CRUSHING'}
            className={`
                mt-6 w-full py-4 rounded-xl font-medium text-white shadow-lg 
                flex items-center justify-center gap-2 transition-all duration-300
                ${!text.trim() ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:scale-[1.02] active:scale-95'}
            `}
          >
            <Trash2 size={20} className={state === 'CRUSHING' ? 'animate-bounce' : ''} />
            {state === 'CRUSHING' ? '粉碎中...' : '彻底粉碎烦恼'}
          </button>
        </div>
      )}

      {/* Processing State */}
      {state === 'PROCESSING' && (
        <div className="flex flex-col items-center justify-center h-48 animate-fade-in">
          <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
          <div className="text-rose-300 animate-pulse text-sm">正在将负面情绪转化为能量...</div>
        </div>
      )}

      {/* Resolved State */}
      {state === 'RESOLVED' && (
        <div className="w-full text-center animate-fade-in bg-slate-800/30 p-8 rounded-2xl border border-mind-accent/20 backdrop-blur-md scale-100 transition-all">
            <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-6 animate-pulse" />
            <p className="text-lg md:text-xl font-light text-white italic mb-10 leading-relaxed tracking-wide">
            "{wisdom}"
            </p>
            <button
            onClick={reset}
            className="px-10 py-3 bg-slate-700/80 hover:bg-slate-600 rounded-full text-white text-sm transition-colors border border-slate-600 hover:border-slate-400"
            >
            感觉好多了
            </button>
        </div>
      )}
    </div>
  );
};

export default VentBox;