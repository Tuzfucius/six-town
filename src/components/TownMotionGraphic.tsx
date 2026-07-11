import { motion } from 'motion/react';
import { useMemo } from 'react';

function DreamGraphic({ color }: { color: string }) {
  // 梦想小镇 - 节点与连接 (Innovation & Network)
  const nodes = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 40 + 10,
    x: 40 + Math.random() * 60,
    y: 10 + Math.random() * 80,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40 mix-blend-screen pointer-events-none">
      {nodes.map(node => (
        <motion.div
          key={node.id}
          className="absolute rounded-full blur-[2px]"
          style={{
            backgroundColor: color,
            width: node.size,
            height: node.size,
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 150 - 75, 0],
            y: [0, Math.random() * 150 - 75, 0],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: node.duration, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* 巨大的模糊光晕 */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full blur-[100px]"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function AIGraphic({ color }: { color: string }) {
  // 人工智能小镇 - 旋转的神经网络环
  const rings = [
    { r: 40, dash: "4 8", duration: 20, dir: 1 },
    { r: 32, dash: "2 6", duration: 15, dir: -1 },
    { r: 24, dash: "8 8", duration: 25, dir: 1 },
    { r: 16, dash: "1 4", duration: 10, dir: -1 },
    { r: 8, dash: "10 5", duration: 30, dir: 1 },
  ];

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[800px] w-[800px] opacity-20 pointer-events-none translate-x-1/4">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
        {rings.map((ring, i) => (
          <motion.circle
            key={i}
            cx="50" cy="50" r={ring.r}
            stroke={color} strokeWidth="0.3" fill="none"
            strokeDasharray={ring.dash}
            style={{ originX: '50px', originY: '50px' }}
            animate={{ rotate: 360 * ring.dir }}
            transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </svg>
    </div>
  );
}

function ComputingGraphic({ color }: { color: string }) {
  // 算力小镇 - 矩阵涟漪 (Ripple Grid)
  const rows = 10;
  const cols = 15;
  
  const grid = useMemo(() => Array.from({ length: rows * cols }).map((_, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    const centerX = cols / 2;
    const centerY = rows / 2;
    // 距离中心的距离，产生涟漪延迟
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    return { id: i, dist };
  }), []);

  return (
    <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
      <div 
        className="grid gap-6" 
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          transform: 'rotateX(45deg) rotateZ(-15deg) scale(1.5)',
          transformStyle: 'preserve-3d'
        }}
      >
        {grid.map((item) => (
          <motion.div
            key={item.id}
            className="w-1.5 h-1.5 rounded-sm shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: color, color: color }}
            animate={{ 
              scale: [0.5, 2, 0.5], 
              opacity: [0.1, 1, 0.1],
              z: [0, 30, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: item.dist * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DeqingGraphic({ color }: { color: string }) {
  // 德清地理信息 - 雷达扫描与经纬网
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30 pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
        <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="0.2" fill="none" />
        <circle cx="50" cy="50" r="30" stroke={color} strokeWidth="0.2" fill="none" strokeDasharray="1 2"/>
        <circle cx="50" cy="50" r="15" stroke={color} strokeWidth="0.2" fill="none" />
        <line x1="5" y1="50" x2="95" y2="50" stroke={color} strokeWidth="0.1" />
        <line x1="50" y1="5" x2="50" y2="95" stroke={color} strokeWidth="0.1" />
        
        {/* 雷达指针 */}
        <motion.g style={{ originX: '50px', originY: '50px' }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
          <line x1="50" y1="50" x2="50" y2="5" stroke={color} strokeWidth="0.5" />
        </motion.g>
      </svg>
      {/* 扫描渐变 */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(from 0deg, transparent 70%, ${color} 100%)`, opacity: 0.15 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function YuechengGraphic({ color }: { color: string }) {
  // 越城集成电路 - 电路板连线
  const paths = [
    { d: "M 0 20 L 20 20 L 40 40 L 100 40", delay: 0 },
    { d: "M 0 80 L 30 80 L 50 60 L 100 60", delay: 1.5 },
    { d: "M 20 100 L 20 60 L 30 50 L 80 50 L 90 40 L 90 0", delay: 3 },
    { d: "M 80 100 L 80 80 L 60 60 L 60 20 L 40 0", delay: 0.5 },
    { d: "M 40 100 L 40 90 L 70 60 L 100 60", delay: 2.5 },
  ];

  return (
    <div className="absolute right-0 top-0 w-full h-full opacity-30 pointer-events-none">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {paths.map((p, i) => (
          <g key={i}>
            {/* 底线 */}
            <path d={p.d} stroke={color} strokeWidth="0.2" fill="none" opacity="0.2" />
            {/* 流动的电流 */}
            <motion.path 
              d={p.d} 
              stroke={color} 
              strokeWidth="0.6" 
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 0.2, 0.2, 0], 
                pathOffset: [0, 0, 0.8, 1],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ duration: 5, delay: p.delay, repeat: Infinity, ease: "linear" }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function JiashanGraphic({ color }: { color: string }) {
  // 嘉善归谷智造 - 蜂巢六边形矩阵
  const hexes = [
    { x: 50, y: 50, delay: 0 },
    { x: 40, y: 33, delay: 0.2 },
    { x: 60, y: 33, delay: 0.4 },
    { x: 30, y: 50, delay: 0.6 },
    { x: 70, y: 50, delay: 0.8 },
    { x: 40, y: 67, delay: 1.0 },
    { x: 60, y: 67, delay: 1.2 },
    { x: 20, y: 33, delay: 1.4 },
    { x: 80, y: 33, delay: 1.6 },
    { x: 20, y: 67, delay: 1.8 },
    { x: 80, y: 67, delay: 2.0 },
  ];

  return (
    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none">
      {hexes.map((hex, i) => (
        <motion.svg 
          key={i}
          viewBox="0 0 100 100" 
          className="absolute w-24 h-24 -ml-12 -mt-12" 
          style={{ left: `${hex.x}%`, top: `${hex.y}%` }}
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 4, delay: hex.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke={color} strokeWidth="2" />
          <motion.circle 
            cx="50" cy="50" r="15" fill={color} opacity="0.2"
            animate={{ scale: [0, 1, 0] }}
            transition={{ duration: 4, delay: hex.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.svg>
      ))}
    </div>
  );
}

export default function TownMotionGraphic({ townId, color }: { townId: string, color: string }) {
  switch (townId) {
    case 'dream': return <DreamGraphic color={color} />;
    case 'ai': return <AIGraphic color={color} />;
    case 'computing': return <ComputingGraphic color={color} />;
    case 'deqing': return <DeqingGraphic color={color} />;
    case 'yuecheng': return <YuechengGraphic color={color} />;
    case 'jiashan': return <JiashanGraphic color={color} />;
    default: return null;
  }
}
