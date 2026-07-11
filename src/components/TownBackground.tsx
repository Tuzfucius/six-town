import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const NetBackground = ({ color }: { color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    const particles: {x: number, y: number, vx: number, vy: number}[] = [];
    const numParticles = Math.min(100, Math.floor((w * h) / 10000));
    
    for(let i=0; i<numParticles; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      });
    }
    
    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      
      for(let i=0; i<particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        if(p.x < 0 || p.x > w) p.vx *= -1;
        if(p.y < 0 || p.y > h) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        for(let j=i+1; j<particles.length; j++) {
          let p2 = particles[j];
          let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if(dist < 150) {
            ctx.globalAlpha = (1 - dist/150) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animationFrame = requestAnimationFrame(render);
    };
    render();
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    }
  }, [color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen" />;
};

const RadarBackground = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center opacity-30">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="relative w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] rounded-full border border-white/10"
      >
        <div className="absolute inset-0 rounded-full border border-current opacity-30 scale-[0.75]" style={{ color }}></div>
        <div className="absolute inset-0 rounded-full border border-current opacity-40 scale-[0.5]" style={{ color }}></div>
        <div className="absolute inset-0 rounded-full border border-current opacity-50 scale-[0.25]" style={{ color }}></div>
        <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] origin-left" style={{ backgroundColor: color, opacity: 0.6 }}>
          <div className="absolute top-0 right-0 w-[50vh] h-[50vh] origin-bottom-left -translate-y-full" 
               style={{ 
                 background: `conic-gradient(from 270deg at 0 100%, ${color}00 0deg, ${color}40 90deg)`,
               }}></div>
        </div>
      </motion.div>
    </div>
  );
};

const CircuitBackground = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px'
    }}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#0c0c0c] to-[#0c0c0c] opacity-80"></div>
      {/* Decorative traces */}
      <div className="absolute top-[120px] left-0 w-[300px] h-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute top-[120px] left-[300px] w-[1px] h-[200px]" style={{ backgroundColor: color }}></div>
      <div className="absolute top-[320px] left-[300px] w-3 h-3 -ml-1 -mt-1 rounded-sm border-2 border-current" style={{ color }}></div>
      
      <div className="absolute bottom-[240px] right-0 w-[400px] h-[1px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[240px] right-[400px] w-[1px] h-[150px]" style={{ backgroundColor: color }}></div>
      <div className="absolute bottom-[390px] right-[400px] w-4 h-4 -ml-1.5 -mt-1.5 rounded-sm border-2 border-current" style={{ color }}></div>
    </div>
  );
};

const PerspectiveGrid = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 opacity-30 flex flex-col justify-end overflow-hidden" style={{ perspective: '1000px' }}>
      <div className="w-[200%] h-[150%] origin-bottom -translate-x-1/4" style={{
        transform: 'rotateX(65deg) translateY(100px)',
        backgroundImage: `
          linear-gradient(to right, ${color} 2px, transparent 2px),
          linear-gradient(to bottom, ${color} 2px, transparent 2px)
        `,
        backgroundSize: '80px 80px'
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#0c0c0c] to-[#0c0c0c] opacity-90"></div>
    </div>
  );
}

const HalftoneBackground = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 opacity-15" style={{
      backgroundImage: `radial-gradient(circle at center, ${color} 2px, transparent 2.5px)`,
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px'
    }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,#0c0c0c_60%)]"></div>
    </div>
  );
};

export default function TownBackground({ townId, color = '#ffffff' }: { townId: string, color?: string }) {
  let bg = null;
  switch (townId) {
    case 'ai':
    case 'dream':
      bg = <NetBackground color={color} />;
      break;
    case 'deqing':
      bg = <RadarBackground color={color} />;
      break;
    case 'computing':
      bg = <PerspectiveGrid color={color} />;
      break;
    case 'yuecheng':
      bg = <CircuitBackground color={color} />;
      break;
    case 'jiashan':
      bg = <HalftoneBackground color={color} />;
      break;
    default:
      bg = <NetBackground color={color} />;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0c0c0c] overflow-hidden">
      {bg}
      {/* Universal vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/80 via-transparent to-[#0c0c0c]/90"></div>
    </div>
  );
}
