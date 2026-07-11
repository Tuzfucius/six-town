import { useMemo } from 'react';
import { ChevronLeft, ExternalLink, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getEnterprisesByTown, getIndustryFilters } from '../data/enterprises';
import { townsData } from '../data/towns';
import type { Enterprise } from '../types/enterprise';
import TownBackground from './TownBackground';
import TownMotionGraphic from './TownMotionGraphic';

function EnterpriseCard({ enterprise }: { enterprise: Enterprise, key?: string }) {
  return (
    <div
      className="group relative flex-none h-full min-h-[400px] w-16 sm:w-20 md:w-24 snap-center overflow-hidden rounded-3xl border border-white/10 transition-[width,background-color,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:w-[85vw] sm:hover:w-[500px] md:hover:w-[700px] bg-white/5 hover:bg-[#0c121c]/95 hover:border-[#A4F4FD]/30 backdrop-blur-md shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#A4F4FD]/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      
      {/* Collapsed State */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-8 opacity-100 transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-[#A4F4FD]/80 shadow-[0_0_8px_rgba(164,244,253,0.8)] shrink-0 mb-8" />
        
        <div 
          className="relative flex-1 w-full overflow-hidden flex justify-center pb-8"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)'
          }}
        >
          <h2 className="text-lg font-medium tracking-[0.2em] text-white/90 whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
            {enterprise.name}
          </h2>
        </div>
      </div>

      {/* Expanded State */}
      <div className="absolute inset-0 w-[85vw] sm:w-[500px] md:w-[700px] opacity-0 transition-opacity duration-500 delay-150 group-hover:opacity-100 p-6 md:p-10 flex flex-col pointer-events-none group-hover:pointer-events-auto overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 rounded-full bg-[#A4F4FD]/10 border border-[#A4F4FD]/20 text-xs font-medium text-[#A4F4FD]">
              {enterprise.primaryIndustry}
            </span>
            <span className="text-xs text-white/40">
              {enterprise.id} · {enterprise.enterpriseType}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">{enterprise.name}</h2>
          
          <p className="text-sm md:text-base text-white/70 leading-relaxed mb-8">
            {enterprise.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                  <span className="w-1 h-1 rounded-full bg-[#A4F4FD]" /> 产业链位置
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">{enterprise.industryChainPosition}</p>
              </div>
              
              {enterprise.productsAndTechnology.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    <span className="w-1 h-1 rounded-full bg-[#A4F4FD]" /> 核心产品与技术
                  </h3>
                  <ul className="text-sm text-white/80 space-y-2">
                    {enterprise.productsAndTechnology.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-white/20 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                  <span className="w-1 h-1 rounded-full bg-[#A4F4FD]" /> 企业地址
                </h3>
                <p className="text-sm text-white/80">{enterprise.address}</p>
                <p className="text-xs text-white/50 mt-2">{enterprise.addressNature}</p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                  <span className="w-1 h-1 rounded-full bg-[#A4F4FD]" /> 小镇协同
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">{enterprise.townRelationship}</p>
              </div>
              
              {enterprise.secondaryIndustries.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                    <span className="w-1 h-1 rounded-full bg-[#A4F4FD]" /> 细分领域
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {enterprise.secondaryIndustries.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded border border-white/10 bg-black/20 text-xs text-white/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {enterprise.officialWebsite && (
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
            <a href={enterprise.officialWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-[#A4F4FD] hover:text-white transition-colors bg-[#A4F4FD]/10 hover:bg-[#A4F4FD]/20 px-4 py-2 rounded-lg">
              访问官网 <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TownView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const town = townId ? townsData[townId] : undefined;
  const townEnterprises = useMemo(() => getEnterprisesByTown(townId ?? ''), [townId]);
  
  const query = searchParams.get('q') ?? '';
  const industry = searchParams.get('industry') ?? '';
  const filters = useMemo(() => getIndustryFilters(townEnterprises), [townEnterprises]);

  if (!town) return <main className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white">未找到对应小镇。</main>;

  const visibleEnterprises = townEnterprises.filter((enterprise) => {
    const haystack = [enterprise.name, ...enterprise.aliases, enterprise.summary, enterprise.primaryIndustry, ...enterprise.secondaryIndustries].join(' ').toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!industry || enterprise.primaryIndustry === industry);
  });

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    setSearchParams(next, { replace: true });
  };
  const clearFilters = () => updateParams({ q: '', industry: '' });

  return <main className="relative min-h-screen overflow-x-hidden bg-[#080b12] text-white flex flex-col">
    <TownBackground townId={town.id} color={town.color} />
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <TownMotionGraphic townId={town.id} color={town.color} />
    </div>
    <div className="relative z-10 flex flex-col h-screen max-h-screen w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex-none flex flex-col md:flex-row items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-start gap-4">
          <button type="button" onClick={() => navigate('/')} className="mt-1 grid h-10 w-10 place-items-center rounded-md border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors" aria-label="返回六镇总览"><ChevronLeft className="h-5 w-5" /></button>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-cyan-200/70 uppercase">企业展示图谱</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl tracking-tight">{town.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{town.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col md:items-end gap-3 text-left md:text-right text-sm text-white/55">
          <div><strong className="block text-2xl text-white">{townEnterprises.length}</strong> 已收录企业</div>
          <button type="button" onClick={() => navigate(`/${town.id}/map`)} className="rounded-md border border-cyan-200/30 bg-cyan-200/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-200/20 transition-colors">查看企业位置</button>
        </div>
      </header>

      {/* Filters */}
      <section className="flex-none mt-6 rounded-2xl border border-white/10 bg-[#101722]/80 py-3 px-4 shadow-xl shadow-black/10 backdrop-blur-sm" aria-label="企业筛选">
        <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
          <label className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 h-10 min-w-[200px] focus-within:border-white/30 transition-colors">
            <Search className="h-4 w-4 text-white/45" />
            <input value={query} onChange={(event) => updateParams({ q: event.target.value })} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35" placeholder="搜索企业名称或业务关键词..." />
          </label>
          <label className="flex flex-1 md:flex-none items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 h-10 min-w-[160px] focus-within:border-white/30 transition-colors">
            <SlidersHorizontal className="h-4 w-4 text-white/45" />
            <select value={industry} onChange={(event) => updateParams({ industry: event.target.value })} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none appearance-none cursor-pointer text-white/80">
              <option value="">全部产业</option>
              {filters.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
            </select>
          </label>
          <button type="button" onClick={clearFilters} className="h-10 rounded-md border border-white/10 px-4 text-sm text-white/70 hover:bg-white/10 transition-colors whitespace-nowrap">清除筛选</button>
        </div>
      </section>

      <div className="flex-none mt-4 flex items-center justify-between text-sm text-white/55">
        <span>显示 {visibleEnterprises.length} 个相关条目</span>
      </div>

      {/* Horizontal Accordion Showcase */}
      <section className="flex-1 mt-4 relative">
        <div className="absolute inset-0 flex items-center gap-3 overflow-x-auto pb-6 pt-2 px-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {visibleEnterprises.length > 0 ? (
            visibleEnterprises.map((enterprise) => (
              <EnterpriseCard key={enterprise.id} enterprise={enterprise} />
            ))
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 border border-dashed border-white/15 rounded-3xl bg-[#101722]/50">
              <Search className="h-8 w-8 mb-4 opacity-50" />
              <p>没有符合条件的企业条目。</p>
            </div>
          )}
        </div>
      </section>
    </div>
  </main>;
}
