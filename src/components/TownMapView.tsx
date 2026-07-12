import { useEffect, useRef, useState, type RefObject } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import { ChevronLeft, ChevronRight, GripVertical, MapPin, Rotate3D } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { getEnterprisesByTown, getMapEnterprisesByTown } from '../data/enterprises';
import { townsData } from '../data/towns';
import type { Enterprise } from '../types/enterprise';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

function enableBuildings(map: maplibregl.Map) {
  if (map.getLayer('enterprise-3d-buildings')) return;
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
      style={{ rotateX, scale, opacity, y, transformStyle: 'preserve-3d' }}
      className={`relative flex flex-col justify-center w-full h-[96px] border-b border-white/5 px-6 py-0 text-left transition-colors snap-start ${selected ? 'bg-[#A4F4FD]/10' : 'hover:bg-white/[0.04]'}`}
    >
      <div className={`absolute left-0 top-1/2 h-[1px] w-2 -translate-y-1/2 transition-all duration-300 ${selected ? 'w-4 bg-[#A4F4FD] shadow-[0_0_8px_rgba(164,244,253,0.8)]' : 'bg-white/20'}`} />
      
      <p className="text-[10px] tracking-wider text-[#A4F4FD]/60 font-mono uppercase truncate">{enterprise.id} · {enterprise.primaryIndustry}</p>
      <h2 className={`mt-1 text-sm font-semibold transition-colors truncate ${selected ? 'text-[#A4F4FD]' : 'text-white/90'}`}>{enterprise.name}</h2>
      <p className="mt-1 line-clamp-2 text-xs leading-4 text-white/50">{enterprise.summary}</p>
    </motion.button>
  );
}

export default function TownMapView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const town = townId ? townsData[townId] : undefined;
  const mapRef = useRef<MapRef>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState<Enterprise | null>(null);
  const enterprises = getEnterprisesByTown(townId ?? '');
  const mapEnterprises = getMapEnterprisesByTown(townId ?? '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!town || !mapRef.current) return;
    mapRef.current.flyTo({ center: [town.mapCenter.longitude, town.mapCenter.latitude], zoom: 14, pitch: 58, bearing: -26, duration: 900 });
  }, [town]);
  if (!town) return <main className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white">未找到对应小镇。</main>;

  const chooseEnterprise = (enterprise: Enterprise) => {
    setSelected(enterprise);
    const center = enterprise.longitude !== undefined && enterprise.latitude !== undefined
      ? [enterprise.longitude, enterprise.latitude] as [number, number]
      : [town.mapCenter.longitude, town.mapCenter.latitude] as [number, number];
    mapRef.current?.flyTo({ center, zoom: 16, pitch: 62, bearing: -38, duration: 850 });
  };

  return <main className="relative h-screen overflow-hidden bg-[#080b12] text-white">
    <Map ref={mapRef} initialViewState={{ ...town.mapCenter, zoom: 14, pitch: 58, bearing: -26 }} mapStyle={MAP_STYLE} dragRotate touchPitch interactive onLoad={(event) => enableBuildings(event.target)} className="absolute inset-0" attributionControl={false}>
      {mapEnterprises.map((enterprise) => (
        <Marker key={enterprise.id} longitude={enterprise.longitude!} latitude={enterprise.latitude!} anchor="bottom">
          <button
            type="button"
            onClick={() => chooseEnterprise(enterprise)}
            aria-label={`定位 ${enterprise.name}`}
            className={`grid h-9 w-9 place-items-center rounded-full border shadow-lg transition-transform hover:scale-110 ${enterprise.isCrossTownEnterprise ? 'border-amber-200 bg-amber-400/90 text-slate-950' : selected?.id === enterprise.id ? 'border-white bg-cyan-200 text-slate-950 scale-110' : 'border-cyan-100/80 bg-[#0b111c]/90 text-cyan-100'}`}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </button>
        </Marker>
      ))}
      <NavigationControl position="bottom-right" visualizePitch />
    </Map>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080b12]/55 via-transparent to-[#080b12]/45" />

    <header className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4 sm:left-6 sm:right-6 sm:top-6">
      <div className="pointer-events-auto flex items-start gap-3"><button type="button" onClick={() => navigate(`/${town.id}/info`)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-[#0b111c]/90 text-white shadow-xl backdrop-blur hover:bg-white/10" aria-label="返回企业资料目录"><ChevronLeft className="h-5 w-5" /></button><div className="rounded-xl border border-white/15 bg-[#0b111c]/90 px-4 py-3 shadow-xl backdrop-blur"><p className="text-xs tracking-[0.14em] text-cyan-100/65 uppercase">三维园区视图</p><h1 className="mt-1 text-base font-semibold">{town.name}</h1></div></div>
      <div className="pointer-events-auto hidden items-center gap-2 rounded-xl border border-white/15 bg-[#0b111c]/90 px-3 py-2 text-xs text-white/65 shadow-xl backdrop-blur sm:flex"><Rotate3D className="h-4 w-4 text-[#A4F4FD]" /><span>拖拽平移，右键拖拽或控制器旋转视角</span></div>
    </header>

    <aside className={`absolute bottom-4 left-0 top-20 z-20 flex transition-[width] duration-300 ease-in-out sm:bottom-6 sm:top-24 ${collapsed ? 'w-12 sm:left-0' : 'w-[min(24rem,calc(100vw))] sm:left-0'}`} aria-label="企业概要列表">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r from-[#0b111c]/95 via-[#0b111c]/80 to-transparent pointer-events-none -z-10 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`} />
      
      <button type="button" onClick={() => setCollapsed((value) => !value)} className={`relative z-10 flex flex-col items-center justify-center w-12 shrink-0 text-white/65 hover:text-white transition-colors ${collapsed ? 'bg-[#0b111c]/90 border border-white/10 border-l-0 rounded-r-xl backdrop-blur-md h-24 my-auto shadow-lg' : 'border-r border-white/10'}`} aria-label={collapsed ? '展开企业概要列表' : '折叠企业概要列表'}>{collapsed ? <ChevronRight className="h-5 w-5 drop-shadow-md" /> : <><ChevronLeft className="h-5 w-5" /><GripVertical className="mt-3 h-4 w-4 text-white/20" /></>}</button>

      <div className={`flex flex-col min-w-0 flex-1 overflow-hidden transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="px-6 py-5 shrink-0">
          <p className="text-xs tracking-[0.2em] text-[#A4F4FD]/70 uppercase font-medium">企业概要</p>
          <p className="mt-1.5 text-sm text-white/75">{enterprises.length} 个已收录企业</p>
        </div>
        
        <div 
          className="relative w-full overflow-hidden h-[384px] shrink-0"
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
            {enterprises.map((enterprise) => (
              <RollerItem 
                key={enterprise.id} 
                enterprise={enterprise} 
                selected={selected?.id === enterprise.id} 
                onSelect={() => chooseEnterprise(enterprise)} 
                containerRef={scrollContainerRef}
              />
            ))}
            <div className="h-[66%] snap-end" />
          </div>
          
          {/* Edge Rulers */}
          <div className="pointer-events-none absolute left-2 top-0 bottom-0 w-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSI5IiB3aWR0aD0iNCIgaGVpZ2h0PSIyIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
        </div>
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
          className="absolute bottom-8 right-8 z-30 w-80 rounded-2xl border border-white/10 bg-[#0b111c]/90 p-5 shadow-2xl backdrop-blur-xl origin-bottom-right"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-[#A4F4FD] font-medium text-sm">
              <MapPin className="h-4 w-4" />
              {selected.name}
            </div>
            <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white transition-colors">
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
