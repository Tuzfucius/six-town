import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Boxes, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { enterprises } from '../data/enterprises';
import { getEnterpriseChainStage, industryChainStages } from '../data/exploration';
import { townsData } from '../data/towns';

export default function IndustryChainView() {
  const navigate = useNavigate();
  const [townId, setTownId] = useState('all');
  const visibleEnterprises = useMemo(
    () => enterprises.filter((enterprise) => !enterprise.isHistoricalDuplicate && (townId === 'all' || enterprise.townId === townId)),
    [townId],
  );

  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080b12]/90 px-4 py-4 backdrop-blur-lg md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/')} aria-label="返回首页" className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white/70 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <div>
              <p className="text-xs text-cyan-200/70">六镇产业协同</p>
              <h1 className="text-xl font-semibold md:text-2xl">产业链视图</h1>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/65">
            <span>筛选小镇</span>
            <select value={townId} onChange={(event) => setTownId(event.target.value)} className="h-10 rounded-md border border-white/15 bg-[#111722] px-3 text-white outline-none focus:border-cyan-200">
              <option value="all">全部六镇</option>
              {Object.values(townsData).map((town) => <option key={town.id} value={town.id}>{town.name}</option>)}
            </select>
          </label>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center gap-3 text-white/60">
          <Boxes className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          <p className="text-sm">依据企业资料中的产业链位置归类，共 {visibleEnterprises.length} 家企业。</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {industryChainStages.map((stage, stageIndex) => {
            const stageEnterprises = visibleEnterprises.filter((enterprise) => getEnterpriseChainStage(enterprise) === stage.id);
            return (
              <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="border-t-2 border-cyan-200/60 bg-white/[0.035] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-200/10 text-xs font-semibold text-cyan-100">{stageIndex + 1}</span>
                    <h2 id={`stage-${stage.id}`} className="font-semibold">{stage.label}</h2>
                  </div>
                  <span className="text-xs text-white/45">{stageEnterprises.length} 家</span>
                </div>
                <div className="space-y-2">
                  {stageEnterprises.map((enterprise) => (
                    <button key={enterprise.id} type="button" onClick={() => navigate(`/${enterprise.townId}/info?enterprise=${enterprise.id}`)} className="group w-full rounded-md border border-white/10 bg-black/20 p-3 text-left hover:border-cyan-200/40 hover:bg-cyan-200/[0.06]">
                      <span className="block text-sm font-medium text-white/90 group-hover:text-cyan-100">{enterprise.name}</span>
                      <span className="mt-2 flex items-center justify-between gap-2 text-xs text-white/50">
                        <span className="flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3 shrink-0" aria-hidden="true" /><span className="truncate">{enterprise.townName}</span></span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                  {stageEnterprises.length === 0 && <p className="py-6 text-center text-sm text-white/40">当前筛选下暂无企业</p>}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
