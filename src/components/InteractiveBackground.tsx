import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import baseBgImg from '../assets/images/base_bg_1783729372930.jpg';
import revealBgImg from '../assets/images/reveal_bg_1783729383684.jpg';

interface InteractiveBackgroundProps {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
}

export default function InteractiveBackground({
  children,
  interactive = true,
  className = '',
}: InteractiveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      containerRef.current?.style.setProperty('--cursor-x', `${event.clientX}px`);
      containerRef.current?.style.setProperty('--cursor-y', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative h-screen w-screen overflow-hidden bg-bg-primary ${interactive ? 'spotlight-container' : ''} before:absolute before:left-[-100px] before:top-[-200px] before:z-0 before:h-[600px] before:w-[600px] before:rounded-full before:bg-[#1a1c3d] before:opacity-30 before:blur-[120px] after:absolute after:bottom-[-150px] after:right-[-50px] after:z-0 after:h-[500px] after:w-[500px] after:rounded-full after:bg-[#2d1a3d] after:opacity-20 after:blur-[100px] ${className}`}
    >
      <div
        className="absolute inset-0 z-0 scale-105 bg-cover bg-center opacity-60 transition-transform duration-[10s] ease-out"
        style={{ backgroundImage: `url(${baseBgImg})` }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 z-10 bg-cover bg-center transition-all duration-[2s] ease-out ${
          interactive ? 'reveal-layer scale-105' : 'scale-100 opacity-10 blur-sm'
        }`}
        style={{ backgroundImage: `url(${revealBgImg})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-20">{children}</div>
    </div>
  );
}
