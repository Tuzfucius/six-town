import type { StyleSpecification } from 'maplibre-gl';

export type BaseMapId = 'dark' | 'light' | 'satellite';

export interface BaseMapOption {
  id: BaseMapId;
  label: string;
  style: string | StyleSpecification;
}

const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Tiles © Esri',
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'esri' }],
};

const chineseRoadStyle: StyleSpecification = {
  version: 8,
  sources: {
    amap: {
      type: 'raster',
      tiles: ['https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'],
      tileSize: 256,
      attribution: '© 高德地图',
    },
  },
  layers: [{ id: 'chinese-roads', type: 'raster', source: 'amap' }],
};

export const baseMaps: BaseMapOption[] = [
  { id: 'dark', label: '深色矢量', style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { id: 'light', label: '中文道路', style: chineseRoadStyle },
  { id: 'satellite', label: '卫星影像', style: satelliteStyle },
];

export const defaultBaseMap: BaseMapId = 'dark';
export const defaultMetroBaseMap: BaseMapId = 'light';
