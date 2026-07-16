import { useCallback, useMemo, useRef, useState, type MouseEvent } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import { ArrowLeft, ChevronRight, Layers, MapPin, Network } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { baseMaps, defaultMetroBaseMap, type BaseMapId } from '../data/mapStyles';
import { enterprises, getCountedEnterprisesByTown } from '../data/enterprises';
import { industryCollaborations, metroCities, townsData, type Town } from '../data/towns';
import { useAutoTour } from '../useAutoTour';
import AutoTourControls from './AutoTourControls';
import { explorationRoutes } from '../data/exploration';

const allTowns = Object.values(townsData);
const markerOffsets: Partial<Record<string, [number, number]>> = {
  dream: [-28, -16],
  ai: [28, 14],
};

function representativeNames(town: Town) {
  return town.representativeEnterpriseIds
    .map((id) => enterprises.find((enterprise) => enterprise.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function MetroOverviewView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRoute = explorationRoutes.find((route) => route.id === searchParams.get('route'));
  const towns = useMemo(
    () => selectedRoute ? selectedRoute.townIds.map((id) => townsData[id]).filter(Boolean) : allTowns,
    [selectedRoute],
  );
  const mapRef = useRef<MapRef>(null);
  const [baseMap, setBaseMap] = useState<BaseMapId>(defaultMetroBaseMap);
  const [hoveredTown, setHoveredTown] = useState<Town | null>(null);
  const [selectedTown, setSelectedTown] = useState<Town | null>(null);
  const selectedStyle = useMemo(() => baseMaps.find((item) => item.id === baseMap)?.style ?? baseMaps[0].style, [baseMap]);

  const visitTown = useCallback((index: number) => {
    const town = towns[index];
    if (!town) return;
    setSelectedTown(town);
    setHoveredTown(null);
    mapRef.current?.flyTo({
      center: [town.mapCenter.longitude, town.mapCenter.latitude],
      zoom: 10.4,
      pitch: 30,
      duration: prefersReducedMotion() ? 0 : 1000,
      essential: false,
    });
  }, [towns]);

  const tour = useAutoTour({ itemCount: towns.length, onVisit: visitTown, intervalMs: 6000 });

  const handleTownClick = (town: Town, event: MouseEvent) => {
    event.stopPropagation();
    tour.pauseForUser();
    if (selectedTown?.id === town.id) {
      navigate(`/${town.id}/info`);
      return;
    }
    tour.visit(towns.findIndex((item) => item.id === town.id));
  };

  const activeTown = hoveredTown ?? selectedTown;
  const activeRelations = activeTown
    ? industryCollaborations.filter(({ from, to }) => from === activeTown.id || to === activeTown.id)
    : [];

  return (
    <main className="relative h-screen overflow-hidden bg-[#07111c] text-white">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 120.32, latitude: 30.42, zoom: 8.15, pitch: 24, bearing: -8 }}
        mapStyle={selectedStyle}
        attributionControl={false}
        className="absolute inset-0"
        onClick={() => tour.pauseForUser()}
        onDragStart={(event) => { if (event.originalEvent) tour.pauseForUser(); }}
        onZoomStart={(event) => { if (event.originalEvent) tour.pauseForUser(); }}
        onRotateStart={(event) => { if (event.originalEvent) tour.pauseForUser(); }}
        onPitchStart={(event) => { if (event.originalEvent) tour.pauseForUser(); }}
        onTouchStart={() => tour.pauseForUser()}
      >
        {metroCities.map((city) => (
          <Marker key={city.name} longitude={city.longitude} latitude={city.latitude} anchor="center">
            <span className="pointer-events-none text-sm font-semibold tracking-[0.18em] text-white/55 drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">{city.name}</span>
          </Marker>
        ))}
        {allTowns.map((town) => {
          const isSelected = selectedTown?.id === town.id;
          const isOnRoute = !selectedRoute || selectedRoute.townIds.includes(town.id);
          return (
            <Marker
              key={town.id}
              longitude={town.mapCenter.longitude}
              latitude={town.mapCenter.latitude}
              anchor="bottom"
              offset={markerOffsets[town.id]}
            >
              <button
                type="button"
                onClick={(event) => handleTownClick(town, event)}
                onMouseEnter={() => setHoveredTown(town)}
                onMouseLeave={() => setHoveredTown(null)}
                onFocus={() => setHoveredTown(town)}
                onBlur={() => setHoveredTown(null)}
                aria-label={`${town.name}，${isSelected ? '再次点击进入企业目录' : '点击选中并定位'}`}
                aria-pressed={isSelected}
                className={`group relative flex cursor-pointer flex-col items-center focus-visible:outline-none ${isOnRoute ? 'opacity-100' : 'opacity-35'}`}
              >
                <span className={`pointer-events-none absolute bottom-3 w-5 rounded-full opacity-70 blur-md transition-all ${isSelected ? 'h-24' : 'h-16 group-hover:h-24 group-focus-visible:h-24'}`} style={{ backgroundColor: town.color }} />
                <span className={`pointer-events-none relative grid h-10 w-10 place-items-center rounded-full border-2 bg-[#07111c]/90 shadow-[0_0_22px_currentColor] transition-transform ${isSelected ? 'scale-110 border-white' : 'border-white/80 group-hover:scale-110 group-focus-visible:scale-110'}`} style={{ color: town.color }}>
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="pointer-events-none mt-2 whitespace-nowrap rounded bg-[#07111c]/90 px-2 py-1 text-xs font-medium text-white shadow-lg backdrop-blur">{town.name}</span>
              </button>
            </Marker>
          );
        })}
        <NavigationControl position="bottom-right" visualizePitch />
      </Map>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07111c]/65 via-transparent to-[#07111c]/45" />

      <header className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-3 sm:left-6 sm:right-6">
        <div className="flex min-w-0 items-start gap-3">
          <button type="button" onClick={() => navigate('/')} aria-label="返回首页" title="返回首页" className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/20 bg-[#07111c]/90 backdrop-blur hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></button>
          <div className="hidden border-l border-white/20 pl-3 sm:block"><p className="text-xs tracking-[0.2em] text-cyan-100/70">都市圈总览</p><h1 className="mt-1 text-lg font-semibold">六镇之间，看见新质生产力</h1></div>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-white/15 bg-[#07111c]/90 p-1 backdrop-blur" aria-label="底图切换">
          <Layers className="ml-1 hidden h-4 w-4 text-cyan-100/70 sm:block" aria-hidden="true" />
          {baseMaps.map((item) => <button key={item.id} type="button" onClick={() => { tour.pauseForUser(); setBaseMap(item.id); }} title={`切换至${item.label}`} aria-pressed={baseMap === item.id} className={`h-8 rounded px-2 text-xs transition-colors ${baseMap === item.id ? 'bg-cyan-200/20 text-cyan-100' : 'text-white/65 hover:bg-white/10'}`}>{item.label}</button>)}
        </div>
      </header>

      <aside className="absolute bottom-20 left-4 z-20 w-[min(23rem,calc(100vw-2rem))] border border-white/15 bg-[#07111c]/90 p-4 shadow-2xl backdrop-blur lg:bottom-6 lg:left-6" aria-live="polite">
        {selectedRoute && <p className="mb-3 border-b border-white/10 pb-3 text-xs leading-5 text-cyan-100">主题路线：{selectedRoute.name}<span className="mt-1 block text-white/55">{selectedRoute.description}</span></p>}
        {activeTown ? (
          <>
            <p className="text-xs tracking-[0.16em]" style={{ color: activeTown.color }}>{activeTown.metroCity} · 产业节点</p>
            <div className="mt-1 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{activeTown.name}</h2>
              <span className="whitespace-nowrap text-xs text-white/55">收录 {getCountedEnterprisesByTown(activeTown.id).length} 家</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{activeTown.industryTags.map((tag) => <span key={tag} className="border border-white/15 px-2 py-1 text-xs text-white/75">{tag}</span>)}</div>
            <p className="mt-3 text-sm text-white/65">代表企业：{representativeNames(activeTown).join('、') || '公开资料未提供'}</p>
            {activeRelations.length > 0 && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="flex items-center gap-1.5 text-xs text-white/50"><Network className="h-3.5 w-3.5" aria-hidden="true" />产业协作</p>
                <p className="mt-1 text-xs leading-5 text-white/70">{activeRelations.map((relation) => relation.label).join('；')}</p>
              </div>
            )}
            <p className="mt-3 flex items-center text-xs text-cyan-100">{selectedTown?.id === activeTown.id ? '再次点击节点进入企业目录' : '点击节点选中并定位'} <ChevronRight className="h-4 w-4" /></p>
          </>
        ) : (
          <>
            <p className="text-xs tracking-[0.16em] text-cyan-100/70">六镇都市圈</p>
            <h2 className="mt-1 text-base font-semibold">选择小镇，查看产业与协作关系</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">首次点击定位并固定信息，再次点击进入对应小镇的企业资料。</p>
          </>
        )}
      </aside>

      <AutoTourControls
        className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 lg:bottom-6 lg:left-auto lg:right-16 lg:translate-x-0"
        status={tour.status}
        currentIndex={tour.currentIndex}
        itemCount={towns.length}
        itemLabel="小镇"
        onPlay={tour.play}
        onPause={tour.pause}
        onPrevious={tour.previous}
        onNext={tour.next}
        onStop={tour.stop}
      />
    </main>
  );
}
