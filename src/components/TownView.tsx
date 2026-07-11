import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ExternalLink, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getEnterprisesByTown, getIndustryFilters } from '../data/enterprises';
import { townsData } from '../data/towns';
import type { Enterprise, VerificationStatus } from '../types/enterprise';
import TownBackground from './TownBackground';

const statusStyles: Record<VerificationStatus, string> = {
  已核验: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  部分核验: 'border-amber-300/40 bg-amber-300/10 text-amber-100',
  待核验: 'border-slate-300/30 bg-white/5 text-white/70',
};

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return <section className="border-t border-white/10 py-4 first:border-t-0 first:pt-0"><h3 className="text-xs font-medium tracking-wide text-white/45">{label}</h3><div className="mt-2 text-sm leading-6 text-white/80">{children}</div></section>;
}

function EnterpriseDetail({ enterprise, onClose }: { enterprise: Enterprise; onClose: () => void }) {
  return <aside className="fixed inset-0 z-50 bg-[#080b12]/95 p-5 backdrop-blur-xl md:static md:z-auto md:h-[calc(100vh-12rem)] md:rounded-lg md:border md:border-white/10 md:bg-[#101722]/90 md:p-6" aria-label="企业详情">
    <div className="mx-auto flex h-full max-w-2xl flex-col md:max-w-none">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div><p className="text-xs text-cyan-200/70">{enterprise.id} · {enterprise.enterpriseType}</p><h2 className="mt-2 text-xl font-semibold text-white">{enterprise.name}</h2></div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 text-white/70 hover:bg-white/10" aria-label="关闭企业详情"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-5 overflow-y-auto pr-1">
        <div className={`mb-5 inline-flex rounded-full border px-2.5 py-1 text-xs ${statusStyles[enterprise.verificationStatus]}`}>{enterprise.verificationStatus}</div>
        <DetailField label="企业摘要">{enterprise.summary}</DetailField>
        <DetailField label="产业与产业链位置"><p>{enterprise.industryChainPosition}</p>{enterprise.secondaryIndustries.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{enterprise.secondaryIndustries.map((tag) => <span key={tag} className="rounded border border-white/15 px-2 py-0.5 text-xs text-white/65">{tag}</span>)}</div>}</DetailField>
        <DetailField label="地址与小镇关联"><p><span className="text-white/45">地址：</span>{enterprise.address}</p><p className="mt-2"><span className="text-white/45">地址性质：</span>{enterprise.addressNature}</p><p className="mt-2"><span className="text-white/45">关联说明：</span>{enterprise.townRelationship}</p></DetailField>
        <DetailField label="代表产品、技术或成果"><ul className="space-y-2">{enterprise.productsAndTechnology.map((item) => <li key={item}>{item}</li>)}</ul></DetailField>
        <DetailField label="对小镇产业生态的作用">{enterprise.industryRole}</DetailField>
        {enterprise.researchNotes && <DetailField label="待核验事项与研究说明">{enterprise.researchNotes}</DetailField>}
        <DetailField label="资料来源">
          <div className="space-y-3">
            {enterprise.officialWebsite && <a className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100" href={enterprise.officialWebsite} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />企业官网</a>}
            {enterprise.sources.length > 0 ? enterprise.sources.map((source) => <a key={source.url} className="block text-cyan-200 hover:text-cyan-100" href={source.url} target="_blank" rel="noreferrer">{source.title}<span className="ml-2 text-xs text-white/40">{source.type} · {source.accessedAt}</span></a>) : <p className="text-white/45">来源补充中；请以条目中的待核验说明为准。</p>}
          </div>
        </DetailField>
      </div>
    </div>
  </aside>;
}

export default function TownView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const town = townId ? townsData[townId] : undefined;
  const townEnterprises = useMemo(() => getEnterprisesByTown(townId ?? ''), [townId]);
  const [selectedId, setSelectedId] = useState(searchParams.get('enterprise') ?? '');
  const query = searchParams.get('q') ?? '';
  const industry = searchParams.get('industry') ?? '';
  const filters = useMemo(() => getIndustryFilters(townEnterprises), [townEnterprises]);

  useEffect(() => setSelectedId(searchParams.get('enterprise') ?? ''), [searchParams]);
  if (!town) return <main className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white">未找到对应小镇。</main>;

  const visibleEnterprises = townEnterprises.filter((enterprise) => {
    const haystack = [enterprise.name, ...enterprise.aliases, enterprise.summary, enterprise.primaryIndustry, ...enterprise.secondaryIndustries].join(' ').toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!industry || enterprise.primaryIndustry === industry);
  });
  const selected = townEnterprises.find((enterprise) => enterprise.id === selectedId) ?? null;
  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    setSearchParams(next, { replace: true });
  };
  const chooseEnterprise = (id: string) => updateParams({ enterprise: id });
  const clearFilters = () => updateParams({ q: '', industry: '', enterprise: '' });

  return <main className="relative min-h-screen overflow-x-hidden bg-[#080b12] text-white">
    <TownBackground townId={town.id} color={town.color} />
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-start gap-4"><button type="button" onClick={() => navigate('/')} className="mt-1 grid h-10 w-10 place-items-center rounded-md border border-white/15 bg-white/5 text-white hover:bg-white/10" aria-label="返回六镇总览"><ChevronLeft className="h-5 w-5" /></button><div><p className="text-xs font-medium tracking-[0.18em] text-cyan-200/70">企业资料目录</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{town.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{town.description}</p></div></div>
        <div className="flex shrink-0 flex-col items-end gap-3 text-right text-sm text-white/55"><div><strong className="block text-2xl text-white">{townEnterprises.length}</strong>已收录企业/项目主体</div><button type="button" onClick={() => navigate(`/${town.id}/map`)} className="rounded-md border border-cyan-200/30 bg-cyan-200/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-200/20">查看企业位置</button></div>
      </header>

      <section className="mt-6 border-y border-white/10 bg-[#101722]/80 py-4" aria-label="企业筛选">
        <div className="grid gap-3 px-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3"><Search className="h-4 w-4 text-white/45" /><input value={query} onChange={(event) => updateParams({ q: event.target.value })} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35" placeholder="搜索企业名称、别名或业务关键词" /></label>
          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3"><SlidersHorizontal className="h-4 w-4 text-white/45" /><select value={industry} onChange={(event) => updateParams({ industry: event.target.value })} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"><option value="">全部产业</option>{filters.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}</select></label>
          <button type="button" onClick={clearFilters} className="h-10 rounded-md border border-white/10 px-3 text-sm text-white/70 hover:bg-white/10">清除筛选</button>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-white/55"><span>显示 {visibleEnterprises.length} / {townEnterprises.length} 个条目</span><span>资料更新于 2026-07-11</span></div>
      <section className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
        <div className="divide-y divide-white/10 border-y border-white/10 bg-[#101722]/70">
          {visibleEnterprises.length ? visibleEnterprises.map((enterprise) => <button type="button" key={enterprise.id} onClick={() => chooseEnterprise(enterprise.id)} className={`block w-full px-5 py-5 text-left transition hover:bg-white/[0.05] ${selected?.id === enterprise.id ? 'bg-cyan-300/[0.08]' : ''}`}>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-cyan-200/65">{enterprise.id} · {enterprise.enterpriseType}</p><h2 className="mt-1 text-base font-semibold text-white">{enterprise.name}</h2></div><span className={`shrink-0 rounded-full border px-2 py-1 text-xs ${statusStyles[enterprise.verificationStatus]}`}>{enterprise.verificationStatus}</span></div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/65">{enterprise.summary}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded border border-white/10 px-2 py-0.5 text-xs text-white/60">{enterprise.primaryIndustry}</span>{enterprise.contactFlag && <span className="text-xs text-white/40">{enterprise.contactFlag}</span>}</div>
          </button>) : <div className="px-5 py-16 text-center text-sm text-white/55">没有符合条件的企业条目。请调整搜索词或筛选条件。</div>}
        </div>
        {selected ? <EnterpriseDetail enterprise={selected} onClose={() => updateParams({ enterprise: '' })} /> : <div className="hidden min-h-[420px] place-items-center border border-dashed border-white/15 bg-[#101722]/50 p-8 text-center text-sm text-white/50 lg:grid"><div><MapPin className="mx-auto h-6 w-6 text-cyan-200/50" /><p className="mt-4">选择左侧企业条目查看已整理资料与来源。</p></div></div>}
      </section>
    </div>
  </main>;
}
