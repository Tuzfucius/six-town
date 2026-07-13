import { useMemo, useState } from 'react';
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl/maplibre';
import { ArrowLeft, ChevronRight, Layers, MapPin, Satellite } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { baseMaps, defaultBaseMap, type BaseMapId } from '../data/mapStyles';
import { enterprises } from '../data/enterprises';
import { industryCollaborations, metroCities, townsData, type Town } from '../data/towns';

const collaborationGeoJson: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
  type: 'FeatureCollection',
  features: industryCollaborations.map((link) => {
    const from = townsData[link.from];
    const to = townsData[link.to];
    return {
      type: 'Feature',
      properties: { label: link.label, from: link.from, to: link.to },
      geometry: { type: 'LineString', coordinates: [[from.mapCenter.longitude, from.mapCenter.latitude], [to.mapCenter.longitude, to.mapCenter.latitude]] },
    };
  }),
};

function representativeNames(town: Town) {
  return town.representativeEnterpriseIds
    .map((id) => enterprises.find((enterprise) => enterprise.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export default function MetroOverviewView() {
  const navigate = useNavigate();
  const [baseMap, setBaseMap] = useState<BaseMapId>(defaultBaseMap);
  const [hoveredTown, setHoveredTown] = useState<Town | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const selectedStyle = useMemo(() => baseMaps.find((item) => item.id === baseMap)?.style ?? baseMaps[0].style, [baseMap]);

  return (
    <main className="relative h-screen overflow-hidden bg-[#07111c] text-white">
      <Map
        initialViewState={{ longitude: 120.32, latitude: 30.42, zoom: 8.15, pitch: 24, bearing: -8 }}
        mapStyle={selectedStyle}
        attributionControl={false}
        interactiveLayerIds={['collaboration-hit-area']}
        onMouseMove={(event) => setHoveredLink((event.features?.[0]?.properties?.label as string | undefined) ?? null)}
        onMouseLeave={() => setHoveredLink(null)}
        className="absolute inset-0"
      >
        <Source id="industry-collaborations" type="geojson" data={collaborationGeoJson}>
          <Layer id="collaboration-glow" type="line" paint={{ 'line-color': '#50e3ff', 'line-width': 10, 'line-opacity': 0.16, 'line-blur': 6 }} />
          <Layer id="collaboration-line" type="line" paint={{ 'line-color': '#9af4ff', 'line-width': 2, 'line-opacity': 0.9, 'line-dasharray': [2, 1.5] }} />
          <Layer id="collaboration-hit-area" type="line" paint={{ 'line-color': '#ffffff', 'line-width': 18, 'line-opacity': 0 }} />
        </Source>
        {metroCities.map((city) => (
          <Marker key={city.name} longitude={city.longitude} latitude={city.latitude} anchor="center">
            <span className="pointer-events-none text-sm font-semibold tracking-[0.18em] text-white/55 drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">{city.name}</span>
          </Marker>
        ))}
        {Object.values(townsData).map((town) => (
          <Marker key={town.id} longitude={town.mapCenter.longitude} latitude={town.mapCenter.latitude} anchor="bottom" onClick={(event) => { event.originalEvent.stopPropagation(); navigate(`/${town.id}/info`); }}>
            <div
              onMouseEnter={() => setHoveredTown(town)}
              onMouseLeave={() => setHoveredTown(null)}
              aria-label={`${town.name}，点击进入企业目录`}
              className="group relative flex cursor-pointer flex-col items-center"
            >
              <span className="absolute bottom-3 h-16 w-5 rounded-full opacity-70 blur-md transition-all group-hover:h-24 group-focus-visible:h-24" style={{ backgroundColor: town.color }} />
              <span className="relative grid h-10 w-10 place-items-center rounded-full border-2 border-white/80 bg-[#07111c]/90 shadow-[0_0_22px_currentColor] transition-transform group-hover:scale-110 group-focus-visible:scale-110" style={{ color: town.color }}><MapPin className="h-5 w-5" /></span>
              <span className="mt-2 whitespace-nowrap rounded bg-[#07111c]/85 px-2 py-1 text-xs font-medium text-white shadow-lg backdrop-blur">{town.name}</span>
            </div>
          </Marker>
        ))}
        <NavigationControl position="bottom-right" visualizePitch />
      </Map>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07111c]/65 via-transparent to-[#07111c]/45" />

      <header className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4 sm:left-6 sm:right-6">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => navigate('/')} aria-label="返回首页" title="返回首页" className="grid h-10 w-10 place-items-center rounded-md border border-white/20 bg-[#07111c]/90 backdrop-blur hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></button>
          <div className="border-l border-white/20 pl-3"><p className="text-xs tracking-[0.2em] text-cyan-100/70">都市圈总览</p><h1 className="mt-1 text-lg font-semibold">六镇之间，看见新质生产力</h1></div>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-white/15 bg-[#07111c]/90 p-1 backdrop-blur" aria-label="底图切换">
          <Layers className="ml-2 h-4 w-4 text-cyan-100/70" aria-hidden="true" />
          {baseMaps.map((item) => <button key={item.id} type="button" onClick={() => setBaseMap(item.id)} title={`切换至${item.label}`} aria-pressed={baseMap === item.id} className={`h-8 rounded px-2 text-xs transition-colors ${baseMap === item.id ? 'bg-cyan-200/20 text-cyan-100' : 'text-white/65 hover:bg-white/10'}`}>{item.id === 'satellite' ? <Satellite className="h-4 w-4" /> : item.label}</button>)}
        </div>
      </header>

      <aside className="absolute bottom-5 left-4 z-20 w-[min(23rem,calc(100vw-2rem))] border border-white/15 bg-[#07111c]/90 p-4 shadow-2xl backdrop-blur sm:left-6 sm:bottom-6" aria-live="polite">
        {hoveredTown ? <><p className="text-xs tracking-[0.16em]" style={{ color: hoveredTown.color }}>{hoveredTown.metroCity} · 产业节点</p><h2 className="mt-1 text-lg font-semibold">{hoveredTown.name}</h2><div className="mt-3 flex flex-wrap gap-2">{hoveredTown.industryTags.map((tag) => <span key={tag} className="border border-white/15 px-2 py-1 text-xs text-white/75">{tag}</span>)}</div><p className="mt-3 text-sm text-white/65">代表企业：{representativeNames(hoveredTown).join('、') || '资料待补充'}</p><p className="mt-3 flex items-center text-xs text-cyan-100">点击节点进入园区地图 <ChevronRight className="h-4 w-4" /></p></> : <><p className="text-xs tracking-[0.16em] text-cyan-100/70">产业协同网络</p><h2 className="mt-1 text-base font-semibold">{hoveredLink ?? '悬停节点或连线查看协同关系'}</h2><p className="mt-2 text-sm leading-6 text-white/65">发光连线表示从创新孵化、技术转化到算力、时空数据和智能装备的产业协同。</p></>}
      </aside>
    </main>
  );
}
