import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import baseBgImg from '../assets/images/base_bg_1783729372930.jpg';
import revealBgImg from '../assets/images/reveal_bg_1783729383684.jpg';
import { townsData } from '../data/towns';

export default function LandingView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isExploring, setIsExploring] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && !isExploring) {
        containerRef.current.style.setProperty('--cursor-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--cursor-y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isExploring]);

  return (
    <div ref={containerRef} className={`relative w-screen h-screen overflow-hidden bg-bg-primary ${!isExploring ? 'spotlight-container' : ''} before:absolute before:top-[-200px] before:left-[-100px] before:w-[600px] before:h-[600px] before:bg-[#1a1c3d] before:rounded-full before:blur-[120px] before:opacity-30 before:z-0 after:absolute after:bottom-[-150px] after:right-[-50px] after:w-[500px] after:h-[500px] after:bg-[#2d1a3d] after:rounded-full after:blur-[100px] after:opacity-20 after:z-0`}>
      {/* Base Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-60 transition-transform duration-[10s] ease-out scale-105"
        style={{ backgroundImage: `url(${baseBgImg})` }}
      />
      
      {/* Reveal Background Layer */}
      <div 
        className={`absolute inset-0 z-10 bg-cover bg-center transition-all duration-[2s] ease-out ${isExploring ? 'opacity-10 scale-100 filter blur-sm' : 'reveal-layer scale-105'}`}
        style={{ backgroundImage: `url(${revealBgImg})` }}
      />
      
      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-8 md:p-12 pointer-events-none">
        
        {/* Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-between items-center pointer-events-auto"
        >
          <div 
            className="text-text-primary font-bold tracking-tight text-xl flex items-center gap-3 cursor-pointer" 
            onClick={() => setIsExploring(false)}
          >
            <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
            杭湖嘉绍六镇图谱平台
          </div>
        </motion.header>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center text-center mt-[-10vh] pointer-events-auto w-full h-full relative">
          <AnimatePresence mode="wait">
            {!isExploring ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -30 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                <h1 className="text-5xl md:text-7xl lg:text-[88px] font-bold tracking-tighter text-center max-w-4xl text-text-primary leading-[1.05]">
                  六镇之间<br />
                  看见<span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">新质生产力</span>
                </h1>
                
                <div className="mt-12 mb-12 flex flex-col items-center">
                  <button 
                    onClick={() => setIsExploring(true)}
                    className="group relative overflow-hidden rounded-xl bg-text-primary text-bg-primary px-8 py-4 font-semibold text-base flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                  >
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-white">开始探索</span>
                    <ArrowRight className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
                    <div className="absolute inset-0 bg-accent-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="towns"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-full max-w-6xl mx-auto"
              >
                <h2 className="text-3xl font-bold mb-10 text-white tracking-tight text-left">选择探索区域</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(townsData).map((town, index) => (
                    <motion.div
                      key={town.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.375, delay: 0.075 * index }}
                      onClick={() => navigate(`/${town.id}/info`)}
                      className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 backdrop-blur-md rounded-2xl p-6 text-left transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-white/50 tracking-wider mb-1">{town.city}</span>
                          <h3 className="text-2xl font-bold text-white group-hover:text-[#A4F4FD] transition-colors">{town.name}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#A4F4FD]/20 transition-colors">
                          <Map className="w-5 h-5 text-white/50 group-hover:text-[#A4F4FD] transition-colors" />
                        </div>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-3 mb-6">
                        {town.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium border border-white/5">
                          {town.subtitle}
                        </span>
                        <div className="flex items-center gap-1 text-white/50 group-hover:text-white transition-colors">
                          <span>进入图谱</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Content */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className={`flex flex-col md:flex-row justify-between items-end gap-8 text-sm pointer-events-auto transition-opacity duration-500 ${isExploring ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="flex flex-col gap-3">
            <div className="text-text-primary text-xs uppercase tracking-widest font-medium">
              杭州 · 湖州 · 嘉兴 · 绍兴
            </div>
            <div className="flex gap-4 text-text-muted font-bold tracking-tighter text-xl opacity-40">
              <span>软</span>
              <span>融</span>
              <span>算</span>
              <span>空</span>
              <span>芯</span>
              <span>智</span>
            </div>
          </div>
          
          <div className="text-text-secondary text-right max-w-[420px] leading-relaxed text-sm border-l border-border-soft pl-5">
            以三维地图为主体的六镇数字展馆、产业导览与空间叙事平台。<br/>
            梦想小镇 / 人工智能小镇 / 算力小镇 / 德清地理信息小镇 / 越城集成电路小镇 / 嘉善归谷智造小镇
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
