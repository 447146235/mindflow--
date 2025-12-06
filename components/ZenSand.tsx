import React, { useRef, useEffect } from 'react';

const ZenSand: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handler
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      initSand();
    };

    const initSand = () => {
      // Fill with sand color
      ctx.fillStyle = '#1e1b4b'; // Deep dark blue sand base
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add noise/texture
      for (let i = 0; i < canvas.width * canvas.height * 0.05; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = Math.random() > 0.5 ? '#312e81' : '#0f172a';
        ctx.fillRect(x, y, 1, 1);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Drawing Logic
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const draw = (x: number, y: number) => {
      if (!isDrawing) return;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      
      // Create a "rake" effect
      ctx.strokeStyle = '#6366f1'; // Indigo glow
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#818cf8';
      ctx.globalCompositeOperation = 'screen'; // Additive blending for glow
      
      ctx.stroke();
      
      // Restore defaults
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;

      lastX = x;
      lastY = y;
    };

    const startDrawing = (x: number, y: number) => {
      isDrawing = true;
      lastX = x;
      lastY = y;
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    // Event Listeners
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      startDrawing(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      draw(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    };
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      startDrawing(e.clientX - rect.left, e.clientY - rect.top);
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      draw(e.clientX - rect.left, e.clientY - rect.top);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if(canvas && ctx) {
        // Fade out effect
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        const fade = setInterval(() => {
            ctx.fillRect(0,0, canvas.width, canvas.height);
        }, 50);
        setTimeout(() => {
            clearInterval(fade);
            // Re-init sand texture
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
             for (let i = 0; i < canvas.width * canvas.height * 0.05; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillStyle = Math.random() > 0.5 ? '#312e81' : '#0f172a';
                ctx.fillRect(x, y, 1, 1);
            }
        }, 1000);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-mind-bg">
      <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-10">
        <h2 className="text-xl text-white/50 font-light">禅意沙画</h2>
        <p className="text-xs text-white/30">指尖划过沙盘，感受宁静</p>
      </div>
      <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair touch-none" />
      <button 
        onClick={clearCanvas}
        className="absolute bottom-24 right-6 bg-slate-700/80 text-white px-4 py-2 rounded-full text-sm hover:bg-slate-600 backdrop-blur-md z-20"
      >
        抚平沙纹
      </button>
    </div>
  );
};

export default ZenSand;