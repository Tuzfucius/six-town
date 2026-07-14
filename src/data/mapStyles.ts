import type { StyleSpecification } from 'maplibre-gl';

export type BaseMapId = 'dark' | 'satellite';

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

export const baseMaps: BaseMapOption[] = [
  { id: 'dark', label: '深色矢量', style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
  { id: 'satellite', label: '卫星影像', style: satelliteStyle },
];

export const defaultBaseMap: BaseMapId = 'dark';
export const defaultMetroBaseMap: BaseMapId = 'dark';
