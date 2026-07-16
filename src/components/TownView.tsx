import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  GitCompareArrows,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCountedEnterprisesByTown, getEnterprisesByTown, getIndustryFilters } from '../data/enterprises';
import { townsData } from '../data/towns';
import type { Enterprise } from '../types/enterprise';
import TownBackground from './TownBackground';
import TownMotionGraphic from './TownMotionGraphic';

type ChainStage = '上游' | '中游' | '下游';

const chainStages: ChainStage[] = ['上游', '中游', '下游'];

function matchesChainStage(enterprise: Enterprise, stage: string) {
  return !stage || enterprise.industryChainPosition.includes(stage);
}

function optionCounts(items: Enterprise[], getValue: (enterprise: Enterprise) => string) {
  return items.reduce<Record<string, number>>((counts, enterprise) => {
    const value = getValue(enterprise);
    if (value) counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function DetailSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-5">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/50">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function EnterpriseDetail({ enterprise }: { enterprise: Enterprise }) {
  return (
    <article className="flex h-full min-h-0 flex-col" aria-labelledby={`enterprise-${enterprise.id}`}>
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-cyan-200/20 bg-cyan-200/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
            {enterprise.primaryIndustry}
          </span>
          <span className="text-xs text-white/45">{enterprise.enterpriseType}</span>
          {enterprise.isCrossTownEnterprise && <span className="text-xs text-amber-200">跨镇应用企业</span>}
          {enterprise.isHistoricalDuplicate && <span className="text-xs text-white/55">历史项目</span>}
        </div>

        <h2 id={`enterprise-${enterprise.id}`} className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
          {enterprise.name}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/70">{enterprise.summary}</p>

        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <DetailSection
            title="核心产品与技术"
            icon={<span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />}
          >
            {enterprise.productsAndTechnology.length > 0 ? (
              <ul className="space-y-2 text-sm leading-6 text-white/80">
                {enterprise.productsAndTechnology.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-white/45">公开资料暂未提供</p>}
          </DetailSection>

          <DetailSection
            title="产业链位置"
            icon={<GitCompareArrows className="h-4 w-4 text-cyan-200" />}
          >
            <p className="text-sm leading-6 text-white/80">{enterprise.industryChainPosition}</p>
            {enterprise.secondaryIndustries.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {enterprise.secondaryIndustries.map((tag) => (
                  <span key={tag} className="rounded border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/60">{tag}</span>
                ))}
              </div>
            )}
          </DetailSection>

          <DetailSection
            title="空间位置"
            icon={<MapPin className="h-4 w-4 text-cyan-200" />}
          >
            <p className="text-sm leading-6 text-white/80">{enterprise.address}</p>
            <p className="mt-2 text-xs leading-5 text-white/50">{enterprise.addressNature}</p>
            <p className="mt-3 text-xs leading-5 text-white/60">{enterprise.townRelationship}</p>
          </DetailSection>

          <DetailSection
            title="资料来源与更新时间"
            icon={<BadgeCheck className="h-4 w-4 text-cyan-200" />}
          >
            <p className="text-xs text-white/50">更新于 {enterprise.updatedAt || '未标注'}</p>
            {enterprise.sources.length > 0 ? (
              <div className="mt-3 flex flex-col items-start gap-2">
                {enterprise.sources.map((source) => (
                  <a
                    key={`${source.url}-${source.title}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs leading-5 text-cyan-100 hover:text-white"
                  >
                    {source.title}<ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ))}
              </div>
            ) : <p className="mt-2 text-xs text-white/45">暂无可公开访问的来源链接</p>}
            {enterprise.verificationNote && <p className="mt-3 text-xs leading-5 text-white/45">{enterprise.verificationNote}</p>}
          </DetailSection>
        </div>
      </div>

      {enterprise.officialWebsite && (
        <footer className="flex-none border-t border-white/10 px-5 py-4 sm:px-6 lg:px-8">
          <a
            href={enterprise.officialWebsite}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-cyan-200/10 px-4 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-200/20 hover:text-white"
          >
            访问企业官网 <ExternalLink className="h-4 w-4" />
          </a>
        </footer>
      )}
    </article>
  );
}

function ComparisonView({ enterprises, onClose }: { enterprises: Enterprise[]; onClose: () => void }) {
  return (
    <section className="flex h-full min-h-0 flex-col" aria-label="企业比较">
      <header className="flex flex-none items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs text-cyan-100/70">企业比较</p>
          <h2 className="mt-1 text-lg font-semibold">已选择 {enterprises.length} 家企业</h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white" aria-label="退出企业比较">
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid min-w-[640px] gap-3" style={{ gridTemplateColumns: `repeat(${enterprises.length}, minmax(200px, 1fr))` }}>
          {enterprises.map((enterprise) => (
            <article key={enterprise.id} className="rounded-md border border-white/10 bg-black/20 p-4">
              <span className="text-xs text-cyan-100">{enterprise.primaryIndustry}</span>
              <h3 className="mt-2 text-lg font-semibold">{enterprise.name}</h3>
              <dl className="mt-5 space-y-5 text-sm">
                <div><dt className="text-xs text-white/40">企业类型</dt><dd className="mt-1 leading-6 text-white/75">{enterprise.enterpriseType}</dd></div>
                <div><dt className="text-xs text-white/40">核心产品与技术</dt><dd className="mt-1 leading-6 text-white/75">{enterprise.productsAndTechnology.join('；') || '公开资料暂未提供'}</dd></div>
                <div><dt className="text-xs text-white/40">产业链位置</dt><dd className="mt-1 leading-6 text-white/75">{enterprise.industryChainPosition}</dd></div>
                <div><dt className="text-xs text-white/40">空间位置</dt><dd className="mt-1 leading-6 text-white/75">{enterprise.address}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TownView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const town = townId ? townsData[townId] : undefined;
  const townEnterprises = useMemo(() => getEnterprisesByTown(townId ?? ''), [townId]);
  const countedEnterprises = useMemo(() => getCountedEnterprisesByTown(townId ?? ''), [townId]);

  const query = searchParams.get('q') ?? '';
  const requestedEnterpriseId = searchParams.get('enterprise') ?? '';
  const industry = searchParams.get('industry') ?? '';
  const enterpriseType = searchParams.get('type') ?? '';
  const chainStage = searchParams.get('chain') ?? '';
  const industries = useMemo(() => getIndustryFilters(townEnterprises), [townEnterprises]);
  const industryCounts = useMemo(() => optionCounts(townEnterprises, (enterprise) => enterprise.primaryIndustry), [townEnterprises]);
  const typeCounts = useMemo(() => optionCounts(townEnterprises, (enterprise) => enterprise.enterpriseType), [townEnterprises]);
  const enterpriseTypes = useMemo(() => Object.keys(typeCounts).sort(), [typeCounts]);
  const chainCounts = useMemo(() => Object.fromEntries(chainStages.map((stage) => [stage, townEnterprises.filter((enterprise) => matchesChainStage(enterprise, stage)).length])), [townEnterprises]);

  const visibleEnterprises = useMemo(() => townEnterprises.filter((enterprise) => {
    const haystack = [enterprise.name, ...enterprise.aliases, enterprise.summary, enterprise.primaryIndustry, ...enterprise.secondaryIndustries].join(' ').toLowerCase();
    return (!query || haystack.includes(query.toLowerCase()))
      && (!industry || enterprise.primaryIndustry === industry)
      && (!enterpriseType || enterprise.enterpriseType === enterpriseType)
      && matchesChainStage(enterprise, chainStage);
  }), [chainStage, enterpriseType, industry, query, townEnterprises]);

  useEffect(() => {
    setSelectedId((current) => {
      if (requestedEnterpriseId && visibleEnterprises.some((enterprise) => enterprise.id === requestedEnterpriseId)) return requestedEnterpriseId;
      return visibleEnterprises.some((enterprise) => enterprise.id === current) ? current : (visibleEnterprises[0]?.id ?? '');
    });
  }, [requestedEnterpriseId, visibleEnterprises]);

  useEffect(() => {
    setCompareIds([]);
    setIsComparing(false);
  }, [townId]);

  const selectedEnterprise = visibleEnterprises.find((enterprise) => enterprise.id === selectedId);
  const comparedEnterprises = compareIds.map((id) => townEnterprises.find((enterprise) => enterprise.id === id)).filter((enterprise): enterprise is Enterprise => Boolean(enterprise));

  if (!town) return <main className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white">未找到对应小镇。</main>;

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => updateParams({ q: '', industry: '', type: '', chain: '' });
  const toggleComparison = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return current.length < 3 ? [...current, id] : current;
    });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#080b12] text-white lg:h-screen lg:overflow-hidden">
      <TownBackground townId={town.id} color={town.color} />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <TownMotionGraphic townId={town.id} color={town.color} />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col px-4 py-5 sm:px-6 lg:h-screen lg:min-h-0 lg:px-8">
        <header className="flex flex-none flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <button type="button" onClick={() => navigate('/')} className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10" aria-label="返回六镇总览">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-cyan-200/70">企业展示图谱</p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{town.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{town.description}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-5 pl-14 text-sm text-white/55 md:pl-0">
            <div><strong className="block text-2xl text-white">{countedEnterprises.length}</strong>已收录企业</div>
            <button type="button" onClick={() => navigate(`/${town.id}/map`)} className="rounded-md border border-cyan-200/30 bg-cyan-200/10 px-3 py-2 text-sm text-cyan-100 transition-colors hover:bg-cyan-200/20">查看企业位置</button>
          </div>
        </header>

        <section className="mt-4 flex-none border-y border-white/10 bg-[#101722]/75 px-3 py-3 backdrop-blur-sm" aria-label="企业筛选">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 min-w-[220px] flex-[2] items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 focus-within:border-white/30">
              <Search className="h-4 w-4 text-white/45" />
              <input value={query} onChange={(event) => updateParams({ q: event.target.value })} className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/35" placeholder="搜索企业或业务关键词" aria-label="搜索企业" />
            </label>
            <FilterSelect label="产业筛选" value={industry} onChange={(value) => updateParams({ industry: value })} icon={<SlidersHorizontal className="h-4 w-4" />} options={[
              { value: '', label: `全部产业（${townEnterprises.length}）` },
              ...industries.map((item) => ({ value: item, label: `${item}（${industryCounts[item]}）` })),
            ]} />
            <FilterSelect label="企业类型筛选" value={enterpriseType} onChange={(value) => updateParams({ type: value })} icon={<Building2 className="h-4 w-4" />} options={[
              { value: '', label: '全部类型' },
              ...enterpriseTypes.map((item) => ({ value: item, label: `${item}（${typeCounts[item]}）` })),
            ]} />
            <FilterSelect label="产业链位置筛选" value={chainStage} onChange={(value) => updateParams({ chain: value })} icon={<GitCompareArrows className="h-4 w-4" />} options={[
              { value: '', label: '全产业链' },
              ...chainStages.map((stage) => ({ value: stage, label: `${stage}（${chainCounts[stage]}）` })),
            ]} />
            <button type="button" onClick={clearFilters} className="h-10 rounded-md px-3 text-sm text-white/65 hover:bg-white/10 hover:text-white">清除筛选</button>
          </div>
        </section>

        <div className="mt-3 flex flex-none flex-wrap items-center justify-between gap-2 text-sm text-white/55">
          <span>显示 {visibleEnterprises.length} 个相关条目</span>
          <button
            type="button"
            disabled={compareIds.length < 2}
            onClick={() => setIsComparing(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-white/75 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <GitCompareArrows className="h-4 w-4" />比较企业（{compareIds.length}/3）
          </button>
        </div>

        <section className="mt-3 min-h-0 flex-1 lg:grid lg:grid-cols-[minmax(260px,32%)_minmax(0,1fr)] lg:overflow-hidden lg:border lg:border-white/10 lg:bg-[#0b111b]/88 lg:backdrop-blur-md" aria-label="企业目录">
          <div className="flex gap-2 overflow-x-auto pb-3 lg:block lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-white/10 lg:p-2" style={{ scrollbarWidth: 'thin' }}>
            {visibleEnterprises.map((enterprise) => {
              const isSelected = enterprise.id === selectedId;
              const isCompared = compareIds.includes(enterprise.id);
              const comparisonFull = compareIds.length >= 3 && !isCompared;
              return (
                <div key={enterprise.id} className={`relative w-[78vw] max-w-[320px] shrink-0 rounded-md border transition-colors sm:w-[300px] lg:mb-2 lg:w-full lg:max-w-none ${isSelected ? 'border-cyan-200/35 bg-cyan-200/10' : 'border-white/10 bg-[#101722]/90 hover:bg-white/[0.07]'}`}>
                  <button
                    type="button"
                    onClick={() => { setSelectedId(enterprise.id); setIsComparing(false); }}
                    className="block w-full p-4 pr-12 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
                    aria-pressed={isSelected}
                    aria-label={`查看${enterprise.name}详情`}
                  >
                    <span className="block truncate text-xs text-cyan-100/75">{enterprise.primaryIndustry}</span>
                    <strong className="mt-1.5 block text-base font-semibold leading-6 text-white">{enterprise.name}</strong>
                    <span className="mt-2 block line-clamp-2 text-xs leading-5 text-white/50">{enterprise.summary}</span>
                  </button>
                  <label className={`absolute right-3 top-3 grid h-7 w-7 place-items-center rounded border ${isCompared ? 'border-cyan-200/50 bg-cyan-200/20 text-cyan-100' : 'border-white/15 bg-black/20 text-transparent'} ${comparisonFull ? 'cursor-not-allowed opacity-35' : 'cursor-pointer'}`} title={isCompared ? '移出比较' : '加入比较'}>
                    <input type="checkbox" checked={isCompared} disabled={comparisonFull} onChange={() => toggleComparison(enterprise.id)} className="sr-only" aria-label={`${isCompared ? '移出' : '加入'}比较：${enterprise.name}`} />
                    <Check className="h-4 w-4" />
                  </label>
                </div>
              );
            })}
            {visibleEnterprises.length === 0 && (
              <div className="flex min-h-48 w-full flex-col items-center justify-center border border-dashed border-white/15 bg-[#101722]/50 text-white/40 lg:h-full">
                <Search className="mb-3 h-7 w-7 opacity-50" />
                <p>没有符合条件的企业条目。</p>
              </div>
            )}
          </div>

          <div className="min-h-[520px] overflow-hidden border border-white/10 bg-[#0b111b]/92 backdrop-blur-md lg:min-h-0 lg:border-0">
            {isComparing && comparedEnterprises.length >= 2
              ? <ComparisonView enterprises={comparedEnterprises} onClose={() => setIsComparing(false)} />
              : selectedEnterprise
                ? <EnterpriseDetail enterprise={selectedEnterprise} />
                : <div className="grid h-full min-h-80 place-items-center text-sm text-white/45">请从企业列表中选择一个条目</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

interface FilterOption {
  value: string;
  label: string;
}

function FilterSelect({ label, value, onChange, icon, options }: { label: string; value: string; onChange: (value: string) => void; icon: ReactNode; options: FilterOption[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-[150px] flex-1 md:flex-none">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-10 w-full items-center gap-2 rounded-md border bg-[#0b111c] px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 ${open ? 'border-cyan-200/50' : 'border-white/15 hover:border-white/30'}`}
      >
        <span className="shrink-0 text-white/45" aria-hidden="true">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-white/85">{selectedOption?.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div role="listbox" aria-label={label} className="absolute left-0 top-[calc(100%+0.375rem)] z-50 max-h-64 min-w-full w-max max-w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-white/15 bg-[#0b111c] p-1.5 shadow-2xl shadow-black/60">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value || '__all'}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`flex min-h-9 w-full items-center gap-3 rounded px-3 py-2 text-left text-sm transition-colors ${selected ? 'bg-cyan-200/15 text-cyan-100' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}
              >
                <Check className={`h-4 w-4 shrink-0 ${selected ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
                <span className="whitespace-normal leading-5">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
