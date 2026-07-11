import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ChevronLeft, Layers, MapPin, Maximize, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { townsData } from '../data/towns';

export default function TownMapView() {
  const navigate = useNavigate();
  const { townId } = useParams<{ townId: string }>();
  const town = townId && townsData[townId as keyof typeof townsData] ? townsData[townId as keyof typeof townsData] : townsData['yuecheng'];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c0c0c] text-white flex">
      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        <Map
          initialViewState={{
            longitude: town.mapCoords?.longitude || 120.5833,
            latitude: town.mapCoords?.latitude || 30.05,
            zoom: 12,
            pitch: 45,
            bearing: -17.6
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        />
      </div>

      {/* Floating Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none"
      >
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={() => navigate(`/${town.id}/info`)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="bg-[#0e1014]/90 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 shadow-2xl">
            <h1 className="font-semibold text-lg tracking-tight">{town.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-white/50 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>地图视图 · 产业图谱加载完毕</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button className="w-10 h-10 rounded-xl bg-[#0e1014]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Layers className="w-5 h-5 text-white/70" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#0e1014]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Maximize className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </motion.div>

      {/* Left Sidebar overlay */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute top-28 left-6 bottom-6 w-80 bg-[#0e1014]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col z-10 pointer-events-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-sm">空间布局分析</h2>
          <Settings className="w-4 h-4 text-white/40" />
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {town.mapData?.markers.map((marker, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${marker.color}33` }}>
                  <MapPin className="w-3 h-3" style={{ color: marker.color }} />
                </div>
                <div className="font-medium text-sm">{marker.name}</div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                {marker.desc}
              </p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate(`/${town.id}/info`)}
          className="w-full py-3 mt-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          查看详细产业图谱
        </button>
      </motion.div>
    </div>
  );
}
