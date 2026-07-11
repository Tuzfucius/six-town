import { useEffect, useRef, useState } from 'react';
import Map, { NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import { ChevronLeft, ChevronRight, GripVertical, MapPin, Rotate3D } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEnterprisesByTown } from '../data/enterprises';
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

function EnterpriseSummary({ enterprise, selected, onSelect }: { enterprise: Enterprise; selected: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className={`w-full border-b border-white/10 px-4 py-4 text-left transition ${selected ? 'bg-cyan-200/10' : 'hover:bg-white/[0.06]'}`}>
    <p className="text-xs text-cyan-100/60">{enterprise.id} · {enterprise.primaryIndustry}</p>
    <h2 className="mt-1 text-sm font-semibold text-white">{enterprise.name}</h2>
    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/60">{enterprise.summary}</p>
  </button>;
}

export default function TownMapView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const town = townId ? townsData[townId] : undefined;
  const mapRef = useRef<MapRef>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState<Enterprise | null>(null);
  const enterprises = getEnterprisesByTown(townId ?? '');

  useEffect(() => {
    if (!town || !mapRef.current) return;
    mapRef.current.flyTo({ center: [town.mapCenter.longitude, town.mapCenter.latitude], zoom: 14, pitch: 58, bearing: -26, duration: 900 });
  }, [town]);
  if (!town) return <main className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white">未找到对应小镇。</main>;

  const chooseEnterprise = (enterprise: Enterprise) => {
    setSelected(enterprise);
    mapRef.current?.flyTo({ center: [town.mapCenter.longitude, town.mapCenter.latitude], zoom: 14.5, pitch: 62, bearing: -38, duration: 850 });
  };

  return <main className="relative h-screen overflow-hidden bg-[#080b12] text-white">
    <Map ref={mapRef} initialViewState={{ ...town.mapCenter, zoom: 14, pitch: 58, bearing: -26 }} mapStyle={MAP_STYLE} dragRotate touchPitch interactive onLoad={(event) => enableBuildings(event.target)} className="absolute inset-0" attributionControl={false}>
      <NavigationControl position="bottom-right" visualizePitch />
    </Map>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080b12]/55 via-transparent to-[#080b12]/45" />

    <header className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4 sm:left-6 sm:right-6 sm:top-6">
      <div className="pointer-events-auto flex items-start gap-3"><button type="button" onClick={() => navigate(`/${town.id}/info`)} className="grid h-10 w-10 place-items-center rounded-md border border-white/20 bg-[#0b111c]/90 text-white shadow-xl backdrop-blur hover:bg-white/10" aria-label="返回企业资料目录"><ChevronLeft className="h-5 w-5" /></button><div className="border border-white/15 bg-[#0b111c]/90 px-4 py-3 shadow-xl backdrop-blur"><p className="text-xs tracking-[0.14em] text-cyan-100/65">三维园区视图</p><h1 className="mt-1 text-base font-semibold">{town.name}</h1></div></div>
      <div className="pointer-events-auto hidden items-center gap-2 border border-white/15 bg-[#0b111c]/90 px-3 py-2 text-xs text-white/65 shadow-xl backdrop-blur sm:flex"><Rotate3D className="h-4 w-4 text-cyan-100" /><span>拖拽平移，右键拖拽或控制器旋转视角</span></div>
    </header>

    <aside className={`absolute bottom-4 left-4 top-20 z-20 flex border border-white/15 bg-[#0b111c]/95 shadow-2xl backdrop-blur-xl transition-[width] duration-200 sm:bottom-6 sm:left-6 sm:top-24 ${collapsed ? 'w-12' : 'w-[min(22rem,calc(100vw-2rem))]'}`} aria-label="企业概要列表">
      <div className={`min-w-0 flex-1 overflow-hidden ${collapsed ? 'hidden' : 'block'}`}>
        <div className="border-b border-white/10 px-4 py-4"><p className="text-xs tracking-wide text-white/45">企业概要</p><p className="mt-1 text-sm text-white/75">{enterprises.length} 个已收录企业/项目主体</p></div>
        <div className="h-[calc(100%-7rem)] overflow-y-auto">{enterprises.map((enterprise) => <div key={enterprise.id}><EnterpriseSummary enterprise={enterprise} selected={selected?.id === enterprise.id} onSelect={() => chooseEnterprise(enterprise)} /></div>)}</div>
        {selected && <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#111d2b] px-4 py-3 text-xs leading-5 text-white/65"><div className="flex items-center gap-2 text-cyan-100"><MapPin className="h-3.5 w-3.5" />{selected.name}</div><p className="mt-1">企业具体坐标尚未录入；当前仅定位至小镇参考视角。</p></div>}
      </div>
      <button type="button" onClick={() => setCollapsed((value) => !value)} className="grid w-12 shrink-0 place-items-center border-l border-white/10 text-white/65 hover:bg-white/10" aria-label={collapsed ? '展开企业概要列表' : '折叠企业概要列表'}>{collapsed ? <ChevronRight className="h-5 w-5" /> : <><ChevronLeft className="h-5 w-5" /><GripVertical className="mt-3 h-4 w-4 text-white/35" /></>}</button>
    </aside>
  </main>;
}
