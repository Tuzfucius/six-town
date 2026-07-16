import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Boxes, Earth, Map, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import baseBgImg from '../assets/images/base_bg_1783729372930.jpg';
import revealBgImg from '../assets/images/reveal_bg_1783729383684.jpg';
import { townsData } from '../data/towns';
import { explorationRoutes } from '../data/exploration';

type ExploreMode = 'region' | 'industry';

export default function LandingView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isExploring, setIsExploring] = useState(false);
  const [exploreMode, setExploreMode] = useState<ExploreMode>('region');

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
          <button
            type="button"
            className="text-white/40 hover:text-white/80 transition-colors font-medium tracking-widest text-sm flex items-center gap-3 cursor-pointer mix-blend-plus-lighter" 
            onClick={() => setIsExploring(false)}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            杭湖嘉绍六镇图谱平台
          </button>
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
                
                <div className="mt-12 mb-12 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 px-4 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/metro?intro=1')}
                    className="group relative flex min-h-14 flex-1 items-center justify-center gap-3 overflow-hidden rounded-lg border border-[#A4F4FD]/50 bg-[#A4F4FD]/10 px-6 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(164,244,253,0.12)] transition-all duration-300 hover:border-[#A4F4FD] hover:bg-[#A4F4FD]/15 hover:shadow-[0_0_30px_rgba(164,244,253,0.22)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A4F4FD]"
                  >
                    <Earth className="relative z-10 h-5 w-5 text-[#A4F4FD]" aria-hidden="true" />
                    <span className="relative z-10 tracking-widest">空间导览</span>
                    <ArrowRight className="relative z-10 h-5 w-5 text-[#A4F4FD] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#A4F4FD]/15 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExploring(true)}
                    className="group flex min-h-14 flex-1 items-center justify-center gap-3 rounded-lg border border-white/25 bg-white/5 px-6 py-4 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Map className="h-5 w-5 text-white/70 transition-colors group-hover:text-white" aria-hidden="true" />
                    <span className="tracking-widest">浏览六镇</span>
                    <ArrowRight className="h-5 w-5 text-white/60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
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
                className="mx-auto flex max-h-[76vh] w-full max-w-6xl flex-col items-center overflow-y-auto px-1 pb-4"
              >
                <div className="mb-6 flex w-full flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">选择探索方式</h2>
                    <p className="mt-1 text-sm text-white/55">从空间区域或产业主题进入六镇图谱</p>
                  </div>
                  <div className="flex h-10 items-center rounded-md border border-white/15 bg-black/30 p-1" role="group" aria-label="探索方式">
                    <button type="button" aria-pressed={exploreMode === 'region'} onClick={() => setExploreMode('region')} className={`h-8 rounded px-3 text-sm transition-colors ${exploreMode === 'region' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                      按区域探索
                    </button>
                    <button type="button" aria-pressed={exploreMode === 'industry'} onClick={() => setExploreMode('industry')} className={`h-8 rounded px-3 text-sm transition-colors ${exploreMode === 'industry' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
                      按产业探索
                    </button>
                  </div>
                </div>

                {exploreMode === 'region' ? <div
                  className="chroma-grid"
                      onMouseMove={(e) => {
                        const grid = e.currentTarget;
                        for (const card of grid.children) {
                          if (card instanceof HTMLElement) {
                            const rect = card.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            card.style.setProperty('--x', `${x}px`);
                            card.style.setProperty('--y', `${y}px`);
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        const grid = e.currentTarget;
                        for (const card of grid.children) {
                          if (card instanceof HTMLElement) {
                            card.style.setProperty('--x', `-1000px`);
                            card.style.setProperty('--y', `-1000px`);
                          }
                        }
                      }}
                    >
                      {Object.values(townsData).map((town, index) => (
                        <motion.button
                          type="button"
                          key={town.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.375, delay: 0.075 * index }}
                          onClick={() => navigate(`/${town.id}/info`)}
                          className="chroma-card group cursor-pointer text-left backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                          style={{
                            '--card-border': town.color,
                            '--spotlight-color': `${town.color}33`, // 20% opacity
                            '--card-gradient': `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${town.color}15 100%)`,
                          } as React.CSSProperties}
                        >
                          <div className="chroma-overlay"></div>
                          <div className="chroma-fade"></div>
                          
                          <div className="relative z-10 p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-mono text-white/50 tracking-wider mb-1">{town.city}</span>
                                <h3 className="text-2xl font-bold text-white transition-colors" style={{ color: town.color }}>{town.name}</h3>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-colors" style={{ backgroundColor: `${town.color}15` }}>
                                <Map className="w-5 h-5" style={{ color: town.color }} />
                              </div>
                            </div>
                            <p className="text-sm text-white/70 line-clamp-3 mb-6 flex-1">
                              {town.description}
                            </p>
                            <div className="flex items-center justify-between text-sm mt-auto">
                              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium border border-white/5">
                                {town.subtitle}
                              </span>
                              <div className="flex items-center gap-1 text-white/50 group-hover:text-white transition-colors">
                                <span>进入图谱</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  : <div className="grid w-full gap-3 px-4 sm:grid-cols-2 xl:grid-cols-4">
                      {explorationRoutes.map((route, index) => (
                        <motion.button
                          type="button"
                          key={route.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.08 }}
                          onClick={() => navigate(`/metro?route=${route.id}`)}
                          className="group min-h-64 rounded-lg border border-white/15 bg-black/30 p-5 text-left backdrop-blur-md transition-colors hover:border-cyan-200/50 hover:bg-cyan-200/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                        >
                          <span className="mb-6 grid h-10 w-10 place-items-center rounded-md bg-cyan-200/10 text-cyan-100">
                            <Route className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <h3 className="text-xl font-semibold text-white">{route.name}</h3>
                          <p className="mt-3 min-h-12 text-sm leading-relaxed text-white/60">{route.description}</p>
                          <div className="mt-5 flex flex-wrap gap-1.5">
                            {route.townIds.map((townId, townIndex) => (
                              <span key={townId} className="flex items-center gap-1 text-xs text-white/55">
                                {townIndex > 0 && <ArrowRight className="h-3 w-3" aria-hidden="true" />}
                                {townsData[townId].name.replace('/未来科技城', '')}
                              </span>
                            ))}
                          </div>
                          <span className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-cyan-100/80">
                            在都市圈中查看路线
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                          </span>
                        </motion.button>
                      ))}
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: explorationRoutes.length * 0.08 }}
                        onClick={() => navigate('/industry-chain')}
                        className="group min-h-64 rounded-lg border border-white/15 bg-black/30 p-5 text-left backdrop-blur-md transition-colors hover:border-cyan-200/50 hover:bg-cyan-200/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                      >
                        <span className="mb-6 grid h-10 w-10 place-items-center rounded-md bg-cyan-200/10 text-cyan-100">
                          <Boxes className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <h3 className="text-xl font-semibold text-white">产业链视图</h3>
                        <p className="mt-3 min-h-12 text-sm leading-relaxed text-white/60">
                          按上游基础设施、中游技术与产品、下游应用浏览六镇企业。
                        </p>
                        <div className="mt-5 flex flex-wrap gap-1.5 text-xs text-white/55">
                          <span>上游基础</span>
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          <span>中游技术</span>
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          <span>下游应用</span>
                        </div>
                        <span className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-cyan-100/80">
                          进入产业链视图
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                      </motion.button>
                    </div>}
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
