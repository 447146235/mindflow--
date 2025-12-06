import React, { useRef, useEffect } from 'react';
import { Particle } from '../types';

const CosmicFlow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const count = window.innerWidth < 768 ? 50 : 100;
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: Math.random(),
          color: `hsl(${Math.random() * 60 + 180}, 70%, 50%)`, // Blue/Cyan range
          size: Math.random() * 3 + 1
        });
      }
    };
    initParticles();

    const animate = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        // Basic movement
        p.x += p.vx;
        p.y += p.vy;

        // Mouse interaction (gravity/repulsion)
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200) {
          const force = (200 - distance) / 200;
          // Gentle attraction
          p.vx += (dx / distance) * force * 0.2;
          p.vy += (dy / distance) * force * 0.2;
        }

        // Dampening
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Boundaries (wrap around)
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMove = (x: number, y: number) => {
        mouseRef.current = { x, y };
    }

    const onTouch = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY);

    window.addEventListener('touchmove', onTouch);
    window.addEventListener('mousemove', onMouse);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('mousemove', onMouse);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-mind-bg">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
         <h2 className="text-xl text-white/50 font-light">星际流光</h2>
         <p className="text-xs text-white/30">触摸屏幕，牵引流光</p>
      </div>
    </div>
  );
};

export default CosmicFlow;