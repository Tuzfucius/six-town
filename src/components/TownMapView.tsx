import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import { ChevronLeft, ChevronRight, Crosshair, Filter, GripVertical, Layers, MapPin, Rotate3D, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from 'motion/react';
import { getEnterprisesByTown, getMapEnterprisesByTown } from '../data/enterprises';
import { townsData } from '../data/towns';
import type { Enterprise } from '../types/enterprise';
import { baseMaps, defaultBaseMap, type BaseMapId } from '../data/mapStyles';
import AutoTourControls from './AutoTourControls';
import { useAutoTour } from '../useAutoTour';

function enableBuildings(map: maplibregl.Map) {
  if (map.getLayer('enterprise-3d-buildings') || !map.getSource('carto')) return;
  map.addLayer({
    id: 'enterprise-3d-buildings', type: 'fill-extrusion', source: 'carto', 'source-layer': 'building',
    minzoom: 13,
    paint: {
      'fill-extrusion-color': '#263b52',
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 6],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
      'fill-extrusion-opacity': 0.86,
    },
  });
}

function RollerItem({ 
  enterprise, 
  selected, 
  onSelect, 
  containerRef
}: { 
  enterprise: Enterprise; 
  selected: boolean; 
  onSelect: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  key?: string | number;
}) {
  const itemRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: itemRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-60, 0, 60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 1, 0.1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [30, 0, -30]);

  return (
    <motion.button
      ref={itemRef}
      type="button"
      onClick={onSelect}
      data-enterprise-id={enterprise.id}
      style={{ rotateX, scale, opacity, y, transformStyle: 'preserve-3d' }}
      className={`relative flex flex-col justify-center w-full h-[96px] border-b border-white/5 px-6 py-0 text-left transition-colors snap-center ${selected ? 'bg-[#A4F4FD]/10' : 'hover:bg-white/[0.04]'}`}
    >
      <div className={`absolute left-0 top-1/2 h-[1px] w-2 -translate-y-1/2 transition-all duration-300 ${selected ? 'w-4 bg-[#A4F4FD] shadow-[0_0_8px_rgba(164,244,253,0.8)]' : 'bg-white/20'}`} />
      
      <p className="text-[10px] tracking-wider text-[#A4F4FD]/60 font-mono uppercase truncate">{enterprise.id} · {enterprise.primaryIndustry}</p>
      <h2 className={`mt-1 text-sm font-semibold transition-colors truncate ${selected ? 'text-[#A4F4FD]' : 'text-white/90'}`}>{enterprise.name}</h2>
      <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/50">{enterprise.summary}</p>
    </motion.button>
  );
}

function FlatEnterpriseItem({ enterprise, selected, onSelect }: { enterprise: Enterprise; selected: boolean; onSelect: () => void; key?: string | number }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex min-h-[96px] w-full flex-col justify-center border-b border-white/5 px-6 py-4 text-left transition-colors ${selected ? 'bg-[#A4F4FD]/10' : 'hover:bg-white/[0.04]'}`}
    >
      <div className={`absolute left-0 top-1/2 h-[1px] -translate-y-1/2 transition-all duration-300 ${selected ? 'w-4 bg-[#A4F4FD] shadow-[0_0_8px_rgba(164,244,253,0.8)]' : 'w-2 bg-white/20'}`} />
      <p className="text-[10px] tracking-wider text-[#A4F4FD]/60 font-mono uppercase truncate">{enterprise.id} · {enterprise.primaryIndustry}</p>
      <h2 className={`mt-1 text-sm font-semibold transition-colors ${selected ? 'text-[#A4F4FD]' : 'text-white/90'}`}>{enterprise.name}</h2>
      <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/50">{enterprise.summary}</p>
    </button>
  );
}

export default function TownMapView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const town = townId ? townsData[townId] : undefined;
  const mapRef = useRef<MapRef>(null);
  const reduceMotion = useReducedMotion();
  const [baseMap, setBaseMap] = useState<BaseMapId>(defaultBaseMap);
  const [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width: 639px)').matches);
  const [industry, setIndustry] = useState('');
  const [onlySelected, setOnlySelected] = useState(false);
  const enterprises = getEnterprisesByTown(townId ?? '');
  const [selected, setSelected] = useState<Enterprise | null>(() => enterprises[0] ?? null);
  const mapEnterprises = getMapEnterprisesByTown(townId ?? '');
  const industries = useMemo(() => [...new Set(mapEnterprises.map((enterprise) => enterprise.primaryIndustry))].sort(), [mapEnterprises]);
  const tourEnterprises = useMemo(
    () => industry ? mapEnterprises.filter((enterprise) => enterprise.primaryIndustry === industry) : mapEnterprises,
    [industry, mapEnterprises],
  );
  const visibleMapEnterprises = onlySelected && selected
    ? mapEnterprises.filter((enterprise) => enterprise.id === selected.id)
    : tourEnterprises;
  const usesRollerList = enterprises.length >= 3;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const focusEnterprise = useCallback((enterprise: Enterprise) => {
    setSelected(enterprise);
    if (!town) return;
    const center = enterprise.longitude !== undefined && enterprise.latitude !== undefined
      ? [enterprise.longitude, enterprise.latitude] as [number, number]
      : [town.mapCenter.longitude, town.mapCenter.latitude] as [number, number];
    mapRef.current?.flyTo({ center, zoom: 16, pitch: 62, bearing: -38, duration: reduceMotion ? 0 : 850 });
  }, [reduceMotion, town]);

  const tour = useAutoTour({
    itemCount: tourEnterprises.length,
    onVisit: (index) => {
      const enterprise = tourEnterprises[index];
      if (enterprise) focusEnterprise(enterprise);
    },
  });

  const chooseEnterprise = useCallback((enterprise: Enterprise) => {
    tour.pauseForUser();
    focusEnterprise(enterprise);
  }, [focusEnterprise, tour.pauseForUser]);

  const fitAllEnterprises = useCallback(() => {
    tour.pauseForUser();
    if (!town || mapEnterprises.length === 0) return;
    const coordinates = mapEnterprises.map((enterprise) => [enterprise.longitude!, enterprise.latitude!] as [number, number]);
    if (coordinates.length === 1) {
      mapRef.current?.flyTo({ center: coordinates[0], zoom: 16, duration: reduceMotion ? 0 : 700 });
      return;
    }
    const longitudes = coordinates.map(([longitude]) => longitude);
    const latitudes = coordinates.map(([, latitude]) => latitude);
    mapRef.current?.fitBounds(
      [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]],
      { padding: 100, duration: reduceMotion ? 0 : 800, maxZoom: 16 },
    );
  }, [mapEnterprises, reduceMotion, tour.pauseForUser, town]);

  useEffect(() => {
    if (!town || !mapRef.current) return;
    mapRef.current.flyTo({ center: [town.mapCenter.longitude, town.mapCenter.latitude], zoom: 14, pitch: 58, bearing: -26, duration: reduceMotion ? 0 : 900 });
  }, [reduceMotion, town]);
  useEffect(() => {
    setSelected(enterprises[0] ?? null);
  }, [townId]);
  useEffect(() => {
    if (!selected || !usesRollerList) return;
    const frame = requestAnimationFrame(() => {
      scrollContainerRef.current?.querySelector<HTMLButtonElement>(`[data-enterprise-id="${selected.id}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected?.id, usesRollerList]);
  if (!town) return <main className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white">未找到对应小镇。</main>;

  const mapStyle = baseMaps.find((item) => item.id === baseMap)?.style ?? baseMaps[0].style;

  return <main className="relative h-screen overflow-hidden bg-[#080b12] text-white">
    <div className="absolute inset-0">
    <Map
      ref={mapRef}
      initialViewState={{ ...town.mapCenter, zoom: 14, pitch: 58, bearing: -26 }}
      mapStyle={mapStyle}
      dragRotate
      touchPitch
      interactive
      onDragStart={tour.pauseForUser}
      onZoomStart={(event) => { if (event.originalEvent) tour.pauseForUser(); }}
      onRotateStart={(event) => { if (event.originalEvent) tour.pauseForUser(); }}
      onPitchStart={(event) => { if (event.originalEvent) tour.pauseForUser(); }}
      onLoad={(event) => enableBuildings(event.target)}
      onStyleData={(event) => enableBuildings(event.target)}
      attributionControl={false}
    >
      {visibleMapEnterprises.map((enterprise) => (
        <Marker key={enterprise.id} longitude={enterprise.longitude!} latitude={enterprise.latitude!} anchor="bottom" onClick={(event) => { event.originalEvent.stopPropagation(); chooseEnterprise(enterprise); }}>
          <div aria-label={`定位 ${enterprise.name}`} title={`查看 ${enterprise.name}`} className="pointer-events-none group relative grid h-10 w-10 cursor-pointer place-items-center">
            <span className={`absolute bottom-4 h-20 w-4 rounded-full blur-md transition-all group-hover:h-28 group-focus-visible:h-28 ${enterprise.isCrossTownEnterprise ? 'bg-amber-300/80' : selected?.id === enterprise.id ? 'bg-cyan-200/90' : 'bg-cyan-300/65'}`} />
            <span className={`relative grid h-9 w-9 place-items-center rounded-full border shadow-lg transition-transform group-hover:scale-110 group-focus-visible:scale-110 ${enterprise.isCrossTownEnterprise ? 'border-amber-200 bg-amber-400/90 text-slate-950' : selected?.id === enterprise.id ? 'border-white bg-cyan-200 text-slate-950 scale-110' : 'border-cyan-100/80 bg-[#0b111c]/90 text-cyan-100'}`}><MapPin className="h-4 w-4" aria-hidden="true" /></span>
          </div>
        </Marker>
      ))}
      <NavigationControl position="bottom-right" visualizePitch />
    </Map>
    </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080b12]/55 via-transparent to-[#080b12]/45" />

      <header className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4 sm:left-6 sm:right-6 sm:top-6">
      <div className="pointer-events-auto flex items-start gap-3"><button type="button" onClick={() => navigate(`/${town.id}/info`)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-[#0b111c]/90 text-white shadow-xl backdrop-blur hover:bg-white/10" aria-label="返回企业资料目录"><ChevronLeft className="h-5 w-5" /></button><div className="rounded-xl border border-white/15 bg-[#0b111c]/90 px-4 py-3 shadow-xl backdrop-blur"><p className="text-xs tracking-[0.14em] text-cyan-100/65 uppercase">三维园区视图</p><h1 className="mt-1 text-base font-semibold">{town.name}</h1></div></div>
      <div className="pointer-events-auto hidden items-center gap-2 rounded-xl border border-white/15 bg-[#0b111c]/90 px-3 py-2 text-xs text-white/65 shadow-xl backdrop-blur sm:flex"><Rotate3D className="h-4 w-4 text-[#A4F4FD]" /><span>拖拽平移，右键拖拽或控制器旋转视角</span></div>
      </header>
      <div className="absolute right-4 top-20 z-20 flex items-center gap-1 rounded-md border border-white/15 bg-[#0b111c]/90 p-1 shadow-xl backdrop-blur sm:right-6 sm:top-24" aria-label="底图切换">
        <Layers className="ml-2 h-4 w-4 text-cyan-100/70" aria-hidden="true" />
        {baseMaps.map((item) => <button key={item.id} type="button" onClick={() => { tour.pauseForUser(); setBaseMap(item.id); }} title={`切换至${item.label}`} aria-pressed={baseMap === item.id} className={`h-8 rounded px-2 text-xs transition-colors ${baseMap === item.id ? 'bg-cyan-200/20 text-cyan-100' : 'text-white/65 hover:bg-white/10'}`}>{item.label}</button>)}
      </div>

      <section className="absolute right-4 top-[7.75rem] z-20 flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-md border border-white/15 bg-[#0b111c]/90 p-1 shadow-xl backdrop-blur sm:right-6 sm:top-[8.5rem]" aria-label="地图企业筛选">
        <Filter className="ml-2 h-4 w-4 shrink-0 text-cyan-100/70" aria-hidden="true" />
        <label className="sr-only" htmlFor="map-industry-filter">按产业筛选地图企业</label>
        <select
          id="map-industry-filter"
          value={industry}
          onChange={(event) => { tour.pauseForUser(); setOnlySelected(false); setIndustry(event.target.value); }}
          className="h-8 min-w-0 max-w-40 bg-transparent px-1 text-xs text-white/75 outline-none"
        >
          <option value="" className="bg-slate-950">全部产业</option>
          {industries.map((item) => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
        </select>
        <button type="button" onClick={() => { tour.pauseForUser(); setOnlySelected((value) => !value); }} aria-pressed={onlySelected} disabled={!selected} className={`h-8 whitespace-nowrap rounded px-2 text-xs ${onlySelected ? 'bg-cyan-200/20 text-cyan-100' : 'text-white/65 hover:bg-white/10 disabled:opacity-40'}`}>仅当前</button>
        <button type="button" onClick={fitAllEnterprises} className="grid h-8 w-8 shrink-0 place-items-center rounded text-white/65 hover:bg-white/10 hover:text-white" aria-label="适配全部企业点位" title="适配全部企业点位"><Crosshair className="h-4 w-4" /></button>
      </section>

      <AutoTourControls
        status={tour.status}
        currentIndex={tour.currentIndex}
        itemCount={tourEnterprises.length}
        onPlay={tour.play}
        onPause={tour.pause}
        onPrevious={tour.previous}
        onNext={tour.next}
        onStop={tour.stop}
        itemLabel="企业"
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 sm:bottom-6"
      />

    <aside className={`absolute bottom-4 left-0 top-20 z-20 flex transition-[width] duration-300 ease-in-out sm:bottom-6 sm:top-24 ${collapsed ? 'w-12 sm:left-0' : 'w-[min(24rem,calc(100vw))] sm:left-0'}`} aria-label="企业概要列表">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r from-[#0b111c]/95 via-[#0b111c]/80 to-transparent pointer-events-none -z-10 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`} />
      
      <button type="button" onClick={() => setCollapsed((value) => !value)} className={`relative z-10 flex flex-col items-center justify-center w-12 shrink-0 text-white/65 hover:text-white transition-colors ${collapsed ? 'bg-[#0b111c]/90 border border-white/10 border-l-0 rounded-r-xl backdrop-blur-md h-24 my-auto shadow-lg' : 'border-r border-white/10'}`} aria-label={collapsed ? '展开企业概要列表' : '折叠企业概要列表'}>{collapsed ? <ChevronRight className="h-5 w-5 drop-shadow-md" /> : <><ChevronLeft className="h-5 w-5" /><GripVertical className="mt-3 h-4 w-4 text-white/20" /></>}</button>

      <div className={`flex flex-col min-w-0 flex-1 overflow-hidden transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="px-6 py-5 shrink-0">
          <p className="text-xs tracking-[0.2em] text-[#A4F4FD]/70 uppercase font-medium">企业概要</p>
          <p className="mt-1.5 text-sm text-white/75">{enterprises.length} 个已收录企业</p>
        </div>
        
        {usesRollerList ? (
          <div
            className="relative h-[384px] w-full shrink-0 overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)'
            }}
          >
            <div
              ref={scrollContainerRef}
              className="absolute inset-0 overflow-y-auto snap-y snap-mandatory scroll-smooth pr-8"
              style={{ scrollbarWidth: 'none', perspective: '1000px' }}
            >
              <div className="h-[144px] shrink-0" aria-hidden="true" />
              {enterprises.map((enterprise) => (
                <RollerItem
                  key={enterprise.id}
                  enterprise={enterprise}
                  selected={selected?.id === enterprise.id}
                  onSelect={() => chooseEnterprise(enterprise)}
                  containerRef={scrollContainerRef}
                />
              ))}
              <div className="h-[144px] shrink-0" aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-2 top-0 w-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSI5IiB3aWR0aD0iNCIgaGVpZ2h0PSIyIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          </div>
        ) : (
          <div className="w-full shrink-0 pr-8">
            {enterprises.map((enterprise) => (
              <FlatEnterpriseItem key={enterprise.id} enterprise={enterprise} selected={selected?.id === enterprise.id} onSelect={() => chooseEnterprise(enterprise)} />
            ))}
          </div>
        )}
      </div>
    </aside>

    {/* Floating Selected Enterprise Card */}
    <AnimatePresence>
      {selected && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-20 left-4 right-4 z-30 max-h-[42vh] overflow-y-auto rounded-lg border border-white/10 bg-[#0b111c]/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-80 sm:max-h-none sm:rounded-lg sm:p-5 origin-bottom-right"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-[#A4F4FD] font-medium text-sm">
              <MapPin className="h-4 w-4" />
              {selected.name}
            </div>
            <button type="button" onClick={() => { tour.pauseForUser(); setSelected(null); }} className="grid h-8 w-8 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-white transition-colors" aria-label="关闭企业详情" title="关闭企业详情">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs text-[#A4F4FD]/60 mb-2">{selected.primaryIndustry} {selected.secondaryIndustries.length > 0 && `· ${selected.secondaryIndustries[0]}`}</p>
          <p className="text-sm leading-relaxed text-white/70 line-clamp-4">{selected.summary}</p>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs leading-5 text-white/65">{selected.address}</p>
            <p className="mt-1 text-[10px] text-white/40">{selected.isCrossTownEnterprise ? '跨界应用企业' : selected.townRelationship}</p>
            <div className="mt-3 flex justify-end">
            <button onClick={() => navigate(`/${town.id}/info`)} className="text-xs font-medium text-[#A4F4FD] hover:text-white transition-colors">
              查看详情 &rarr;
            </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </main>;
}
