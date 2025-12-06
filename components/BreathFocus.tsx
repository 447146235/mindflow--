import React, { useState, useEffect } from 'react';
import { Wind, PauseCircle, CornerDownRight, Volume2, VolumeX } from 'lucide-react';
import { startMeditationDrone, stopMeditationDrone, resumeAudioContext } from '../services/audioService';

const BreathFocus: React.FC = () => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [instruction, setInstruction] = useState('吸气');
  const [duration, setDuration] = useState(4000); // Current phase duration in ms
  const [cycleKey, setCycleKey] = useState(0); 
  
  // BGM State - Default ON
  const [isMusicOn, setIsMusicOn] = useState(true);

  // Handle Music Lifecycle
  useEffect(() => {
    if (isMusicOn) {
        startMeditationDrone();
    } else {
        stopMeditationDrone();
    }

    // Cleanup on unmount (leave page)
    return () => {
        stopMeditationDrone();
    };
  }, [isMusicOn]);

  const toggleMusic = async () => {
      // Vital: User gesture must trigger audio context resume
      await resumeAudioContext(); 
      setIsMusicOn(prev => !prev);
  };

  useEffect(() => {
    // 4-7-8 Breathing Technique (Dr. Andrew Weil)
    // Famous for reducing anxiety and helping with sleep.
    // Inhale 4s, Hold 7s, Exhale 8s.
    let isActive = true;
    
    const runCycle = async () => {
      if (!isActive) return;

      // --- Inhale (4s) ---
      setPhase('Inhale');
      setInstruction('用鼻子深深吸气 (4秒)');
      setDuration(4000);
      setCycleKey(k => k + 1);
      await new Promise(r => setTimeout(r, 4000));
      
      if (!isActive) return;

      // --- Hold (7s) ---
      setPhase('Hold');
      setInstruction('保持气息，感受宁静 (7秒)');
      setDuration(7000);
      setCycleKey(k => k + 1);
      await new Promise(r => setTimeout(r, 7000));
      
      if (!isActive) return;

      // --- Exhale (8s) ---
      setPhase('Exhale');
      setInstruction('用嘴缓慢呼出烦恼 (8秒)');
      setDuration(8000);
      setCycleKey(k => k + 1);
      await new Promise(r => setTimeout(r, 8000));
    };

    const loop = async () => {
      while (isActive) {
        await runCycle();
      }
    };

    loop();

    return () => {
        isActive = false;
    };
  }, []);

  // Visual Configuration based on Phase
  const getConfig = () => {
    switch(phase) {
        case 'Inhale':
            return {
                color: 'text-cyan-400',
                borderColor: 'border-cyan-400',
                glow: 'shadow-[0_0_50px_rgba(34,211,238,0.6)]',
                bgGradient: 'bg-gradient-to-r from-cyan-500 to-teal-400',
                icon: <Wind className="animate-pulse" />,
                scale: 'scale-150',
                label: '吸入能量'
            };
        case 'Hold':
            return {
                color: 'text-fuchsia-400',
                borderColor: 'border-fuchsia-400',
                glow: 'shadow-[0_0_40px_rgba(232,121,249,0.5)]',
                bgGradient: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
                icon: <PauseCircle className="animate-pulse" />,
                scale: 'scale-150', // Stay expanded during hold
                label: '内化平静'
            };
        case 'Exhale':
            return {
                color: 'text-indigo-400',
                borderColor: 'border-indigo-400',
                glow: 'shadow-[0_0_30px_rgba(129,140,248,0.4)]',
                bgGradient: 'bg-gradient-to-r from-indigo-500 to-blue-600',
                icon: <CornerDownRight className="animate-bounce" />,
                scale: 'scale-100',
                label: '释放焦虑'
            };
    }
  };

  const config = getConfig();

  return (
    <div className="flex flex-col items-center justify-between h-full w-full relative overflow-hidden pt-8 pb-20">
      {/* Background ambient light */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-mind-bg to-slate-900 transition-opacity ease-in-out`}
        style={{ transitionDuration: `${duration}ms`, opacity: phase === 'Inhale' ? 0.7 : 1 }} 
      />

      {/* Top Header & Controls */}
      <div className="z-10 w-full px-6 flex items-start justify-between">
          {/* Empty div for flex balance if needed, or back button space */}
          <div className="w-10"></div>
          
          <div className="text-center flex flex-col items-center gap-3">
             <h2 className="text-2xl font-light text-white/90 tracking-[0.2em] uppercase">冥想呼吸</h2>
             <div className={`transition-colors duration-1000 ${config.color}`}>
                {config.icon}
             </div>
          </div>

          {/* BGM Toggle */}
          <button 
            onClick={toggleMusic}
            className={`
                w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md border transition-all active:scale-95
                ${isMusicOn 
                    ? 'bg-mind-accent/20 border-mind-accent/50 text-mind-accent shadow-[0_0_10px_rgba(56,189,248,0.3)]' 
                    : 'bg-white/5 border-white/10 text-white/50'
                }
            `}
            aria-label={isMusicOn ? "Mute Music" : "Play Music"}
          >
              {isMusicOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
      </div>

      {/* Main Breathing Circle */}
      {/* Added -mt-8 to pull it slightly up to make room for bottom bar if screen is small */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full -mt-4">
        {/* Outer Glow Ring */}
        <div 
            className={`
                w-48 h-48 md:w-64 md:h-64 rounded-full border-2 flex items-center justify-center
                transition-all ease-linear will-change-transform
                ${config.borderColor} 
                ${config.glow}
                ${config.scale}
            `}
            style={{ transitionDuration: `${duration}ms` }}
        >
          {/* Inner Core */}
          <div 
            className={`
                w-24 h-24 md:w-32 md:h-32 bg-white rounded-full blur-xl opacity-80 mix-blend-overlay
                transition-all ease-linear will-change-transform
            `}
            style={{ 
                transitionDuration: `${duration}ms`,
                transform: phase === 'Exhale' ? 'scale(0.5)' : 'scale(1.5)'
            }} 
          />
          
          <span className="absolute text-xl md:text-2xl font-medium text-white tracking-widest drop-shadow-lg animate-fade-in w-full text-center px-4">
            {instruction}
          </span>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      {/* Moved down using mt-auto and reduced bottom margin */}
      <div className="w-full max-w-xs px-6 z-10 flex flex-col gap-2 mb-4 mt-auto">
        <div className="flex justify-between text-xs font-medium text-white/50 uppercase tracking-wider">
            <span>开始</span>
            <span className={config.color}>{config.label}</span>
            <span>结束</span>
        </div>
        
        {/* Track */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/50 shadow-inner">
             {/* 
                Progress Fill 
                Key is crucial here: changing it forces React to destroy and recreate this div,
                triggering the CSS animation from 0% to 100% cleanly for the specific duration.
             */}
            <div 
                key={cycleKey}
                className={`h-full absolute left-0 top-0 rounded-full ${config.bgGradient} shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                style={{
                    width: '100%',
                    animation: `progressLinear ${duration}ms linear forwards`
                }}
            >
                {/* Leading "Spark" */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] opacity-70"></div>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes progressLinear {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      
    </div>
  );
};

export default BreathFocus;