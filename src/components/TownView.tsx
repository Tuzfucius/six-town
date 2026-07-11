import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles, Search, Paperclip, MoreHorizontal, Reply, Forward, Archive, Trash2, Menu } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { townsData } from '../data/towns';
import TownBackground from './TownBackground';

const LogoMark = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 256 256" fill="white" className={className}>
    <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
  </svg>
);

const PrimaryButton = ({ label, full, onClick }: { label: string, full?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] ${full ? 'w-full' : ''}`}>
    {label}
    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[1px]" />
  </button>
);

const SectionEyebrow = ({ label, tag }: { label: string, tag?: string }) => (
  <div className="flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-white" />
    <span className="text-white font-medium text-sm">{label}</span>
    {tag && (
      <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-xs ml-2">
        {tag}
      </span>
    )}
  </div>
);

export default function TownView() {
  const [isYearly, setIsYearly] = useState(true);
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const town = townId ? townsData[townId] : townsData['yuecheng'];

  if (!town) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Town not found</div>;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </motion.button>

      {/* Background Layer */}
      <TownBackground townId={town.id} color={town.color || '#ffffff'} />

      {/* Guide Lines */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      {/* SVG Filters */}
      <svg className="hidden">
        <filter id="c3-noise-shiny">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
        <filter id="c3-noise-overlay">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
          <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Section 1 - Navbar */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <LogoMark />
          </div>
          
          <div className="hidden md:flex gap-8">
            {['产业纵览', '创新生态', '政策服务', '图谱文档', '入驻联络'].map((item, i) => (
              <motion.a 
                key={item} 
                href="#"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                className="text-white/70 text-sm font-medium hover:text-white transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="hidden md:block">
            <PrimaryButton label="进入图谱" />
          </div>
          <button className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </button>
        </motion.nav>

        {/* Section 2 - Hero */}
        <section className="pt-16 md:pt-28 pb-20 text-center flex flex-col items-center px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.9]"
          >
            <span className="block mb-2">{town.name}.</span>
            <span className="animate-shiny block">{town.subtitle}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-white/60 max-w-lg text-base leading-[1.6]"
          >
            {town.description}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <PrimaryButton label="开始探索园区" onClick={() => navigate(`/${town.id}/map`)} />
            <span className="text-xs text-white/40 font-mono tracking-widest uppercase">{town.city}</span>
          </motion.div>
        </section>

        {/* Section 3 - macOS Menu Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-full h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10"
        >
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <LogoMark className="w-3.5 h-3.5" />
              <span className="font-bold text-white">Yuecheng — Map</span>
              <span className="hidden sm:inline text-white/80 cursor-pointer hover:text-white">File</span>
              <span className="hidden sm:inline text-white/80 cursor-pointer hover:text-white">Edit</span>
              <span className="hidden sm:inline text-white/80 cursor-pointer hover:text-white">View</span>
              <span className="hidden md:inline text-white/80 cursor-pointer hover:text-white">Go</span>
              <span className="hidden md:inline text-white/80 cursor-pointer hover:text-white">Window</span>
              <span className="hidden md:inline text-white/80 cursor-pointer hover:text-white">Help</span>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <Search className="w-3.5 h-3.5" />
              <span>Wed May 6 1:09 PM</span>
            </div>
          </div>
        </motion.div>

        {/* Section 4 - Inbox/Dashboard Mockup */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl"
          >
            {/* Window Title Bar */}
            <div className="h-10 flex items-center px-4 border-b border-white/10 bg-white/5 relative">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              </div>
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <span className="text-xs text-white/50 font-medium">{town.name} — 数据图谱</span>
              </div>
            </div>

            {/* Application Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 h-[600px] md:h-[520px]">
              
              {/* Sidebar */}
              <div className="hidden md:block col-span-3 border-r border-white/10 bg-black/30 p-4">
                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2.5 mb-6 hover:bg-gray-100 transition-colors">
                  <Sparkles className="w-4 h-4" />
                  发现园区企业
                </button>
                
                <div className="flex flex-col gap-1 text-sm font-medium">
                  <div className="flex justify-between items-center px-3 py-1.5 bg-white/10 text-white rounded-md cursor-pointer">
                    <span>{town.stats.keyLabel}</span>
                    <span className="text-xs text-white/50">{town.stats.key}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1.5 text-white/60 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <span>{town.stats.scaleLabel}</span>
                    <span className="text-xs text-white/40">{town.stats.scale}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1.5 text-white/60 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <span>{town.stats.platformLabel}</span>
                    <span className="text-xs text-white/40">{town.stats.platform}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1.5 text-white/60 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                    <span>政策服务</span>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="px-3 mb-3 text-[10px] uppercase tracking-widest text-white/40 font-bold">产业链环节</div>
                  <div className="flex flex-col gap-2">
                    {town.industryLinks.map((link: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-1 text-xs text-white/70 cursor-pointer hover:text-white">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }}></span> {link.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="hidden md:flex col-span-4 border-r border-white/10 flex-col overflow-hidden">
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-3 bg-white/[0.02]">
                  <Search className="w-4 h-4 text-white/40" />
                  <input type="text" placeholder="搜索企业名称、领域..." className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full" />
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                  {town.companies.map((company: any, index: number) => (
                    <div key={index} className={`p-4 border-b border-white/5 cursor-pointer ${company.active ? 'bg-brand/20 relative' : 'hover:bg-white/[0.02]'}`}>
                      {company.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand"></div>}
                      <div className="flex justify-between items-baseline mb-1">
                        <div className="flex items-center gap-2">
                          {!company.active && index === 1 && <span className="w-2 h-2 rounded-full bg-brand"></span>}
                          <span className={`text-sm ${company.active ? 'font-semibold text-white' : 'font-medium text-white/90'}`}>{company.name}</span>
                        </div>
                        <span className={`text-xs ${company.active ? 'text-brand font-medium' : 'text-white/40'}`}>{company.time}</span>
                      </div>
                      <div className={`text-xs ${company.active ? 'font-medium text-white' : 'text-white/70'} mb-1`}>{company.tag}</div>
                      <div className="text-xs text-white/60 truncate">{company.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reader */}
              <div className="col-span-1 md:col-span-5 flex flex-col bg-white/[0.01]">
                <div className="h-12 border-b border-white/10 flex items-center justify-between px-4">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                      <Forward className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  <h2 className="text-2xl font-semibold tracking-tight text-white mb-6">{town.detail.title}</h2>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {town.detail.avatarLabel}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {town.detail.sender} 
                        <span className="text-white/40 font-normal">to 园区管理办 · 9:41 AM</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded border border-[#00d2ff]/30 text-[#00d2ff] text-[10px] uppercase font-semibold">{town.detail.tag}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#A4F4FD]/20 bg-[#A4F4FD]/5 p-4 mb-8 flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-[#A4F4FD] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#A4F4FD] mb-1">图谱智能分析</div>
                      <div className="text-sm text-white/80 leading-relaxed">
                        {town.detail.aiSummary}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 text-sm text-white/70 leading-relaxed">
                    <p className="text-white/90 font-medium">{town.detail.content[0]}</p>
                    {town.detail.content.slice(1).map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                    <p className="text-white/40 mt-8">— {town.detail.sender}</p>
                  </div>

                  <div className="mt-8">
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                      <Paperclip className="w-4 h-4 text-white/50" />
                      <span className="text-xs font-medium text-white/80">{town.detail.attachment}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 5 - Feature Triage */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 w-full">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <SectionEyebrow label="产业图谱" tag="AI-native" />
              <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
                {town.triage.title.split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== town.triage.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
              <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
                {town.triage.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {town.triage.chips.map((chip: string) => (
                  <span key={chip} className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="liquid-glass rounded-2xl p-5"
            >
              <div className="text-xs font-medium text-white/50 mb-4 px-2">产业分类收录</div>
              <div className="space-y-3">
                {town.triage.categories.map((cat: any, idx: number) => (
                  <div key={idx} className="liquid-glass rounded-lg p-3 border-l-[3px]" style={{ borderColor: cat.color }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                      <span className="text-xs text-white/50">{cat.count}</span>
                    </div>
                    <div className="text-xs text-white/60">{cat.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 6 - LogoCloud */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 w-full">
          <div className="text-center text-xs uppercase tracking-widest text-white/40 font-semibold">
            头部企业入驻，共筑产业高地
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
            {town.logos.map((logo: string, i: number) => (
              <motion.div 
                key={logo}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="text-sm font-bold tracking-wider text-white/30 hover:text-white transition-colors cursor-default"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 7 - Testimonials */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 w-full border-t border-white/10">
          <div className="grid md:grid-cols-3 gap-6">
            {town.testimonials.map((t: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="liquid-glass rounded-2xl p-6 flex flex-col"
              >
                <p className="text-sm text-white/80 leading-[1.6] flex-1">
                  "{t.quote}"
                </p>
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{t.role}</div>
                  <div className="text-xs text-white font-semibold tracking-wide uppercase mt-2">{t.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 8 - Pricing (Town Capabilities) */}
        <section className="c3-pricing-section w-full">
          <div className="c3-watermark-container">
            <div className="c3-watermark-main">
              <span className="c3-watermark-line-1">{town.pricing.watermark1}</span>
              <span className="c3-watermark-line-2">{town.pricing.watermark2}</span>
            </div>
          </div>

          <div className="c3-toggle-wrap">
            <span className="text-sm font-medium text-white/60">产业聚焦</span>
            <button className={`c3-toggle ${isYearly ? 'active' : ''}`} onClick={() => setIsYearly(!isYearly)}>
              <div className="c3-toggle-knob"></div>
            </button>
            <span className="text-sm font-medium text-white">全局规划</span>
          </div>

          <div className="c3-grid">
            {town.pricing.cards.map((card: any, index: number) => (
              <div key={index} className={`c3-card ${card.isPro ? 'c3-card-pro' : ''}`}>
                <div className={`c3-tier-small ${card.isPro ? 'text-brand font-medium' : ''}`}>{card.tierSmall}</div>
                <div className="c3-tier-large">{card.tierLarge}</div>
                <div className="c3-desc">{card.desc}</div>
                <ul className="c3-list">
                  {card.features.map((feature: string, fIdx: number) => (
                    <li key={fIdx}><div className="c3-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div> <span>{feature}</span></li>
                  ))}
                </ul>
                <button className="c3-btn mt-8">{card.btnText}</button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 9 - Final CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
          >
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)', opacity: 0.3 }}></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                {town.finalCta.title.split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== town.finalCta.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>
              <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
                {town.finalCta.desc}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <PrimaryButton label={town.finalCta.btn1} onClick={() => navigate(`/${town.id}/map`)} />
                <button className="group inline-flex items-center gap-2 rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-colors">
                  {town.finalCta.btn2}
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
