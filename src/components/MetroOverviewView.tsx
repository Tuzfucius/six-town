import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Map, { AttributionControl, Marker, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import { ArrowLeft, ChevronRight, Layers, MapPin, Network, SkipForward } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { baseMaps, defaultMetroBaseMap, type BaseMapId } from '../data/mapStyles';
import { enterprises, getCountedEnterprisesByTown } from '../data/enterprises';
import { industryCollaborations, metroCities, townsData, type Town } from '../data/towns';
import { explorationRoutes } from '../data/exploration';
import { useAutoTour } from '../useAutoTour';
import { useMetroIntro, type IntroStage } from '../useMetroIntro';
import { useTownCardLayout } from '../useTownCardLayout';
import AutoTourControls from './AutoTourControls';

const allTowns = Object.values(townsData);

const introLabels: Record<IntroStage, string> = {
  loading: '正在载入空间底图',
  globe: '从全球视角出发',
  eastChina: '进入中国东部',
  approaching: '接近杭湖嘉绍都市圈',
  revealing: '六镇产业节点正在显现',
  ready: '',
};

function representativeNames(town: Town) {
  return town.representativeEnterpriseIds
    .map((id) => enterprises.find((enterprise) => enterprise.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

function markerConnector(offsetX: number, offsetY: number) {
  const length = Math.hypot(offsetX, offsetY);
  return {
    width: `${length}px`,
    transform: `rotate(${Math.atan2(offsetY, offsetX) * 180 / Math.PI}deg)`,
  };
}

export default function MetroOverviewView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduceMotion = Boolean(useReducedMotion());
  const selectedRoute = explorationRoutes.find((route) => route.id === searchParams.get('route'));
  const wantsIntro = searchParams.get('intro') === '1' && !selectedRoute;
  const towns = useMemo(
    () => selectedRoute ? selectedRoute.townIds.map((id) => townsData[id]).filter(Boolean) : allTowns,
    [selectedRoute],
  );
  const mapRef = useRef<MapRef>(null);
  const [baseMap, setBaseMap] = useState<BaseMapId>(defaultMetroBaseMap);
  const [hoveredTown, setHoveredTown] = useState<Town | null>(null);
  const [selectedTown, setSelectedTown] = useState<Town | null>(null);
  const intro = useMetroIntro({ enabled: wantsIntro, reduceMotion });
  const markersVisible = ['globe', 'revealing', 'ready'].includes(intro.stage);
  const uiRevealTransition = { duration: reduceMotion ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] as const };
  const { layouts, recalculate } = useTownCardLayout(mapRef, allTowns, selectedTown?.id ?? null, markersVisible);
  const selectedStyle = useMemo(
    () => baseMaps.find((item) => item.id === baseMap)?.style ?? baseMaps[0].style,
    [baseMap],
  );

  const visitTown = useCallback((index: number) => {
    const town = towns[index];
    if (!town || !intro.isInteractive) return;
    setSelectedTown(town);
    setHoveredTown(null);
    mapRef.current?.flyTo({
      center: [town.mapCenter.longitude, town.mapCenter.latitude],
      zoom: 10.4,
      pitch: 30,
      duration: reduceMotion ? 0 : 1000,
      essential: false,
    });
  }, [intro.isInteractive, reduceMotion, towns]);

  const tour = useAutoTour({ itemCount: towns.length, onVisit: visitTown, intervalMs: 6000 });

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const applyGlobeAfterStyleChange = () => intro.applyGlobe(map);
    map.on('style.load', applyGlobeAfterStyleChange);
    return () => map.off('style.load', applyGlobeAfterStyleChange);
  }, [baseMap, intro.applyGlobe]);

  useEffect(() => {
    if (intro.stage !== 'revealing') return;
    const revealTimer = window.setTimeout(intro.completeReveal, reduceMotion ? 0 : 1500);
    return () => window.clearTimeout(revealTimer);
  }, [intro.completeReveal, intro.stage, reduceMotion]);

  const handleTownClick = (town: Town, event: MouseEvent) => {
    event.stopPropagation();
    if (!intro.isInteractive) return;
    tour.pauseForUser();
    if (selectedTown?.id === town.id) {
      navigate(`/${town.id}/info`);
      return;
    }
    const routeIndex = towns.findIndex((item) => item.id === town.id);
    if (routeIndex >= 0) tour.visit(routeIndex);
    else {
      setSelectedTown(town);
      mapRef.current?.flyTo({ center: [town.mapCenter.longitude, town.mapCenter.latitude], zoom: 10.4, pitch: 30, duration: reduceMotion ? 0 : 1000 });
    }
  };

  const handleMapLoad = () => {
    const map = mapRef.current;
    if (!map) return;
    void intro.start(map);
  };

  const activeTown = hoveredTown ?? selectedTown;
  const activeRelations = activeTown
    ? industryCollaborations.filter(({ from, to }) => from === activeTown.id || to === activeTown.id)
    : [];

  return (
    <main className="relative h-screen overflow-hidden bg-[#07111c] text-white">
      <Map
        ref={mapRef}
        initialViewState={wantsIntro
          ? { longitude: 72, latitude: 20, zoom: 0.9, pitch: 0, bearing: 0 }
          : { longitude: 120.32, latitude: 30.42, zoom: 8.15, pitch: 24, bearing: -8 }}
        mapStyle={selectedStyle}
        projection={{ type: 'globe' }}
        attributionControl={false}
        className="absolute inset-0"
        onLoad={handleMapLoad}
        onMove={() => { if (markersVisible) recalculate(); }}
        onClick={() => { if (intro.isInteractive) tour.pauseForUser(); }}
        onDragStart={(event) => { if (event.originalEvent && intro.isInteractive) tour.pauseForUser(); }}
        onZoomStart={(event) => { if (event.originalEvent && intro.isInteractive) tour.pauseForUser(); }}
        onRotateStart={(event) => { if (event.originalEvent && intro.isInteractive) tour.pauseForUser(); }}
        onPitchStart={(event) => { if (event.originalEvent && intro.isInteractive) tour.pauseForUser(); }}
        onTouchStart={() => { if (intro.isInteractive) tour.pauseForUser(); }}
      >
        {markersVisible && metroCities.map((city) => (
          <Marker key={city.name} longitude={city.longitude} latitude={city.latitude} anchor="center">
            <span className="pointer-events-none text-xs font-semibold text-white/45 drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">{city.name}</span>
          </Marker>
        ))}

        {markersVisible && allTowns.map((town, index) => {
          const isSelected = selectedTown?.id === town.id;
          const isOnRoute = !selectedRoute || selectedRoute.townIds.includes(town.id);
          const layout = layouts[town.id];
          const showCard = isOnRoute && (isSelected || layout?.mode === 'card');
          return (
            <Marker key={town.id} longitude={town.mapCenter.longitude} latitude={town.mapCenter.latitude} anchor="center">
              <motion.button
                type="button"
                initial={reduceMotion ? false : { opacity: 0, scaleY: 0.2, y: 20 }}
                animate={{ opacity: isOnRoute ? 1 : 0.32, scaleY: 1, y: 0 }}
                transition={{ delay: intro.stage === 'revealing' ? index * 0.14 : 0, duration: reduceMotion ? 0 : 0.52, ease: [0.16, 1, 0.3, 1] }}
                onClick={(event) => handleTownClick(town, event)}
                onMouseEnter={() => setHoveredTown(town)}
                onMouseLeave={() => setHoveredTown(null)}
                onFocus={() => setHoveredTown(town)}
                onBlur={() => setHoveredTown(null)}
                aria-label={`${town.name}，${isSelected ? '再次点击进入企业目录' : '点击选中并定位'}`}
                aria-pressed={isSelected}
                className="group relative grid h-12 w-12 cursor-pointer place-items-center focus-visible:outline-none"
                style={{ color: town.color }}
              >
                <span className="pointer-events-none absolute bottom-5 left-1/2 h-20 w-2 -translate-x-1/2 rounded-full opacity-80 blur-[3px]" style={{ background: `linear-gradient(to top, ${town.color}, transparent)` }} />
                <span className="pointer-events-none absolute bottom-5 left-1/2 h-16 w-px -translate-x-1/2" style={{ background: `linear-gradient(to top, ${town.color}, transparent)` }} />
                <span className={`pointer-events-none relative grid h-9 w-9 place-items-center rounded-full border bg-[#06101c]/90 shadow-[0_0_22px_currentColor] transition-transform ${isSelected ? 'scale-110 border-white' : 'border-white/70 group-hover:scale-110 group-focus-visible:scale-110'}`}>
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>

                <AnimatePresence>
                  {showCard && layout && (
                    <motion.span
                      key={`${town.id}-connector`}
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-px origin-left"
                      style={{ ...markerConnector(layout.offsetX, layout.offsetY + 6), backgroundColor: town.color }}
                    />
                  )}
                  {showCard && layout && (
                    <motion.span
                      key={`${town.id}-card`}
                      initial={reduceMotion ? false : { opacity: 0, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      exit={reduceMotion ? undefined : { opacity: 0, filter: 'blur(6px)' }}
                      transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
                      className="pointer-events-none absolute left-1/2 z-10 block w-52"
                      style={{
                        bottom: `${-layout.offsetY + 18}px`,
                        transform: `translateX(calc(-50% + ${layout.offsetX}px))`,
                      }}
                    >
                      <motion.span
                        layout
                        initial={reduceMotion ? false : { scale: 0.94 }}
                        animate={{ scale: 1 }}
                        exit={reduceMotion ? undefined : { scale: 0.96 }}
                        transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
                        className="relative block overflow-hidden rounded-lg border p-3 text-left shadow-2xl backdrop-blur-xl"
                        style={{
                        borderColor: `${town.color}88`,
                        background: `linear-gradient(135deg, rgba(255,255,255,0.12), ${town.color}24 48%, rgba(4,13,24,0.62))`,
                        boxShadow: `0 16px 42px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 24px ${town.color}18`,
                        }}
                      >
                        <span className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ backgroundColor: town.color }} />
                        <span className="block text-[10px] text-white/55">{town.city}</span>
                        <span className="relative mt-0.5 block text-sm font-semibold" style={{ color: town.color }}>{town.name}</span>
                        <span className="mt-2 flex flex-wrap gap-1">
                          {town.industryTags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-black/15 px-1.5 py-0.5 text-[10px] text-white/70">{tag}</span>)}
                        </span>
                        <span className="mt-2 block text-[10px] text-white/55">收录企业 {getCountedEnterprisesByTown(town.id).length} 家</span>
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>

                {!showCard && <span className="pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded bg-[#07111c]/90 px-1.5 py-1 text-[10px] text-white/75 backdrop-blur">{town.name}</span>}
              </motion.button>
            </Marker>
          );
        })}

        {intro.isInteractive && <NavigationControl position="bottom-right" visualizePitch />}
        <AttributionControl compact position="bottom-right" />
      </Map>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07111c]/55 via-transparent to-[#07111c]/45" />

      <AnimatePresence>
        {intro.isInteractive && (
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: -12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={uiRevealTransition}
            className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-3 sm:left-6 sm:right-6"
          >
            <div className="flex min-w-0 items-start gap-3">
              <button type="button" onClick={() => navigate('/')} aria-label="返回首页" title="返回首页" className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/20 bg-[#07111c]/90 backdrop-blur hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></button>
              <div className="hidden border-l border-white/20 pl-3 sm:block"><p className="text-xs text-cyan-100/70">都市圈总览</p><h1 className="mt-1 text-lg font-semibold">六镇之间，看见新质生产力</h1></div>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-white/15 bg-[#07111c]/90 p-1 backdrop-blur" aria-label="底图切换">
              <Layers className="ml-1 hidden h-4 w-4 text-cyan-100/70 sm:block" aria-hidden="true" />
              {baseMaps.map((item) => <button key={item.id} type="button" onClick={() => { tour.pauseForUser(); setBaseMap(item.id); }} title={`切换至${item.label}`} aria-pressed={baseMap === item.id} className={`h-8 rounded px-2 text-xs transition-colors ${baseMap === item.id ? 'bg-cyan-200/20 text-cyan-100' : 'text-white/65 hover:bg-white/10'}`}>{item.label}</button>)}
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {intro.isIntroActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-20 sm:pb-12">
            <div className="flex items-center gap-3 border border-white/15 bg-[#06101c]/80 px-4 py-3 shadow-2xl backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200 shadow-[0_0_12px_#a5f3fc]" />
              <p className="text-sm text-white/80">{introLabels[intro.stage]}</p>
              {intro.stage !== 'loading' && <button type="button" onClick={intro.skip} className="pointer-events-auto ml-3 flex h-8 items-center gap-1 border-l border-white/15 pl-3 text-xs text-white/65 hover:text-white" aria-label="跳过地球开场"><SkipForward className="h-4 w-4" />跳过</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {intro.isInteractive && (
        <>
          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, x: -16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ ...uiRevealTransition, delay: reduceMotion ? 0 : 0.12 }}
            className="absolute bottom-20 left-4 z-20 w-[min(23rem,calc(100vw-2rem))] border border-white/15 bg-[#07111c]/90 p-4 shadow-2xl backdrop-blur lg:bottom-6 lg:left-6"
            aria-live="polite"
          >
            {selectedRoute && <p className="mb-3 border-b border-white/10 pb-3 text-xs leading-5 text-cyan-100">主题路线：{selectedRoute.name}<span className="mt-1 block text-white/55">{selectedRoute.description}</span></p>}
            {activeTown ? (
              <>
                <p className="text-xs" style={{ color: activeTown.color }}>{activeTown.metroCity} · 产业节点</p>
                <div className="mt-1 flex items-start justify-between gap-3"><h2 className="text-lg font-semibold">{activeTown.name}</h2><span className="whitespace-nowrap text-xs text-white/55">收录 {getCountedEnterprisesByTown(activeTown.id).length} 家</span></div>
                <div className="mt-3 flex flex-wrap gap-2">{activeTown.industryTags.map((tag) => <span key={tag} className="border border-white/15 px-2 py-1 text-xs text-white/75">{tag}</span>)}</div>
                <p className="mt-3 text-sm text-white/65">代表企业：{representativeNames(activeTown).join('、') || '公开资料未提供'}</p>
                {activeRelations.length > 0 && <div className="mt-3 border-t border-white/10 pt-3"><p className="flex items-center gap-1.5 text-xs text-white/50"><Network className="h-3.5 w-3.5" aria-hidden="true" />产业协作</p><p className="mt-1 text-xs leading-5 text-white/70">{activeRelations.map((relation) => relation.label).join('；')}</p></div>}
                <p className="mt-3 flex items-center text-xs text-cyan-100">{selectedTown?.id === activeTown.id ? '再次点击节点进入企业目录' : '点击节点选中并定位'} <ChevronRight className="h-4 w-4" /></p>
              </>
            ) : (
              <><p className="text-xs text-cyan-100/70">六镇都市圈</p><h2 className="mt-1 text-base font-semibold">选择小镇，查看产业节点</h2><p className="mt-2 text-sm leading-6 text-white/65">首次点击定位并固定信息，再次点击进入对应小镇的企业资料。</p></>
            )}
          </motion.aside>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ ...uiRevealTransition, delay: reduceMotion ? 0 : 0.2 }}
            className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 lg:bottom-6 lg:left-auto lg:right-16 lg:translate-x-0"
          >
            <AutoTourControls status={tour.status} currentIndex={tour.currentIndex} itemCount={towns.length} itemLabel="小镇" onPlay={tour.play} onPause={tour.pause} onPrevious={tour.previous} onNext={tour.next} onStop={tour.stop} />
          </motion.div>
        </>
      )}
    </main>
  );
}
