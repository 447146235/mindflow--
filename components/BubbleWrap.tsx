import React, { useState, useEffect, useRef } from 'react';
import { playPopSound } from '../services/audioService';
import { Sparkles } from 'lucide-react';

const GRID_SIZE = 48; // Total bubbles

const BubbleWrap: React.FC = () => {
  const [popped, setPopped] = useState<boolean[]>(new Array(GRID_SIZE).fill(false));
  const [score, setScore] = useState(0);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show a floating message that doesn't block interaction
  const showEncouragement = (msg: string, duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, duration);
  };

  // Idle timer to prompt user if they stop
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
       // Only show idle message if no other toast is active to avoid clutter
       if (!showToast) {
         const idleMsgs = [
             "还在犹豫什么？把烦恼全部挤出去！",
             "不要停，让快乐多停留一会儿。",
             "深呼吸，继续你的解压之旅，别轻易放弃。",
             "如果还有压力，就继续点下去吧。"
         ];
         const msg = idleMsgs[Math.floor(Math.random() * idleMsgs.length)];
         showEncouragement(msg, 5000);
       }
    }, 10000); // Increased to 10 seconds as requested
  };

  useEffect(() => {
    resetIdleTimer();
    // Initial greeting
    setTimeout(() => {
        showEncouragement("试着戳破几个气泡，开始你的解压之旅...", 4000);
    }, 500);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handlePop = (index: number) => {
    if (!popped[index]) {
      playPopSound();
      const newPopped = [...popped];
      newPopped[index] = true;
      setPopped(newPopped);
      
      const newScore = score + 1;
      setScore(newScore);
      
      resetIdleTimer();
      
      // Check milestones for specific encouragement
      if (newScore === 5) showEncouragement("深呼吸，感受指尖的每一次触碰。");
      else if (newScore === 20) showEncouragement("对，就是这样，烦恼正在一点点破碎。");
      else if (newScore === 50) showEncouragement("别停下！感受这种简单的快乐，你的心情正在变好！", 4000);
      else if (newScore === 80) showEncouragement("非常棒！把所有的压力都发泄出来，这里没人评判你。", 4000);
      else if (newScore === 100) showEncouragement("突破100！你的焦虑防线正在瓦解，继续保持。", 4000);
      else if (newScore === 150) showEncouragement("这种节奏感...是不是感觉世界都安静了？", 4000);
      else if (newScore === 200) showEncouragement("太厉害了！现在的你，内心一定比刚才轻盈了许多。", 5000);
      else if (newScore === 250) showEncouragement("每一次破碎，都是一次小小的胜利，不要停。", 4000);
      else if (newScore === 300) showEncouragement("三百成就达成！你已经完全掌控了自己的情绪。", 5000);
      else if (newScore > 300 && newScore % 50 === 0) {
          // Rotate generic positive messages for high scores every 50 clicks
          const highMsgs = [
              "保持这份专注，享受当下的宁静时光。",
              "做得好，让压力随风而去。",
              "每一次点击都是对自我的疗愈。",
              "你很棒，继续享受这纯粹的快乐。",
              "感受这指尖的律动，烦恼已无法靠近。"
          ];
          showEncouragement(highMsgs[(newScore / 50) % highMsgs.length], 4000);
      }

      // Auto regenerate bubble after a delay to allow infinite popping
      setTimeout(() => {
        setPopped(current => {
          const updated = [...current];
          updated[index] = false;
          return updated;
        });
      }, 2000 + Math.random() * 3000);
    }
  };

  const refreshAll = () => {
    setPopped(new Array(GRID_SIZE).fill(false));
    showEncouragement("一切归零，深呼吸，重新开始。", 3000);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-mind-bg pt-8 pb-20 overflow-hidden">
      
      {/* Header Section */}
      <div className="flex-none flex flex-col items-center justify-center px-4 z-10 relative">
        <h2 className="text-3xl font-light text-white tracking-widest drop-shadow-lg mb-2">
            气泡解压
        </h2>
        
        {/* Score Badge */}
        <div className="flex items-center gap-3 bg-slate-800/40 px-4 py-1.5 rounded-full border border-white/10 mb-4">
            <span className="text-slate-300 text-xs tracking-wider uppercase">已释放焦虑值</span>
            <span className="text-xl font-bold text-mind-accent font-mono min-w-[3ch] text-center">
                {score}
            </span>
        </div>

        {/* 
            Floating Encouragement Toast 
            Positioned RELATIVELY within the header flow but absolutely centered horizontally.
            This ensures it sits between header and grid without overlapping the grid.
        */}
        <div className="h-10 w-full flex justify-center items-center relative mb-2">
            <div 
                className={`
                absolute top-0 z-50 pointer-events-none flex justify-center items-center gap-2 px-6 py-2
                rounded-full backdrop-blur-xl bg-slate-800/60 border border-mind-accent/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'}
                `}
            >
                <Sparkles size={14} className="text-mind-accent animate-pulse" />
                <p className="text-sm text-indigo-100/90 font-medium tracking-wide whitespace-nowrap">
                    {toastMessage}
                </p>
            </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 w-full flex items-start justify-center p-2 relative z-0 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-6 gap-3 md:gap-5 p-5 bg-slate-800/20 rounded-3xl backdrop-blur-sm border border-slate-700/30 max-w-md mt-2">
          {popped.map((isPopped, index) => (
            <button
              key={index}
              onClick={() => handlePop(index)}
              className={`
                w-11 h-11 md:w-14 md:h-14 rounded-full transition-all duration-200 ease-out
                flex items-center justify-center relative overflow-hidden group touch-manipulation
                ${isPopped 
                  ? 'bg-slate-800/50 shadow-inner scale-90 border border-slate-700/50' 
                  : 'bg-gradient-to-br from-cyan-400/90 to-blue-600/90 shadow-lg hover:scale-105 active:scale-90 cursor-pointer border border-cyan-300/30'
                }
              `}
              aria-label="Pop bubble"
            >
              {!isPopped && (
                <>
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full blur-[1px]" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 bg-blue-300/20 rounded-full blur-[2px]" />
                </>
              )}
              {isPopped && (
                  <div className="w-full h-full bg-slate-900/50 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-none w-full flex justify-center py-4 z-10">
        <button 
            onClick={refreshAll}
            className="px-8 py-2.5 bg-slate-700/50 hover:bg-slate-600/80 rounded-full text-xs text-slate-300 transition-all hover:scale-105 active:scale-95 backdrop-blur-md border border-slate-600/50 shadow-lg uppercase tracking-widest"
        >
            瞬间复原
        </button>
      </div>
    </div>
  );
};

export default BubbleWrap;