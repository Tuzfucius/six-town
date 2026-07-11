import { ChevronLeft, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { townsData } from '../data/towns';
import TownBackground from './TownBackground';

export default function TownMapView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const town = townId ? townsData[townId] : undefined;
  if (!town) return <main className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white">未找到对应小镇。</main>;
  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080b12] px-6 text-white"><TownBackground townId={town.id} color={town.color} /><section className="relative z-10 max-w-lg border border-white/10 bg-[#101722]/90 p-8 text-center shadow-2xl backdrop-blur-xl"><MapPin className="mx-auto h-9 w-9 text-cyan-200" /><p className="mt-6 text-xs font-medium tracking-[0.18em] text-cyan-200/70">{town.name}</p><h1 className="mt-3 text-2xl font-semibold">企业位置资料整理中</h1><p className="mt-4 text-sm leading-6 text-white/65">本阶段仅展示经整理的企业资料，不展示未经核验的空间点位、园区范围或地图分析结果。</p><button type="button" onClick={() => navigate(`/${town.id}/info`)} className="mt-7 inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-sm hover:bg-white/10"><ChevronLeft className="h-4 w-4" />返回企业资料目录</button></section></main>;
}
