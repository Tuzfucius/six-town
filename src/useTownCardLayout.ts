import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import type { Town } from './data/towns';

export type TownMarkerMode = 'card' | 'node';

export interface TownCardLayout {
  townId: string;
  mode: TownMarkerMode;
  offsetX: number;
  offsetY: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const CARD_WIDTH = 208;
const CARD_HEIGHT = 132;
const VIEWPORT_PADDING = 18;
const COLLISION_GAP = 18;
const CARD_REVEAL_ZOOM = 7.7;
const CANDIDATES = [
  [0, -112], [-132, -104], [132, -104], [-172, -36], [172, -36], [0, -202],
  [-230, -130], [230, -130], [-220, 26], [220, 26], [-116, -232], [116, -232],
] as const;

const overlaps = (a: Rect, b: Rect) => !(
  a.right + COLLISION_GAP <= b.left
  || a.left >= b.right + COLLISION_GAP
  || a.bottom + COLLISION_GAP <= b.top
  || a.top >= b.bottom + COLLISION_GAP
);

export function useTownCardLayout(
  mapRef: RefObject<MapRef | null>,
  towns: Town[],
  selectedTownId: string | null,
  enabled: boolean,
) {
  const [layouts, setLayouts] = useState<Record<string, TownCardLayout>>({});

  const recalculate = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !enabled) return;
    const canvas = map.getCanvas();
    const compactViewport = canvas.clientWidth < 920;
    const overviewScale = map.getZoom() >= CARD_REVEAL_ZOOM && map.getZoom() <= 9.25;
    const ordered = [...towns].sort((a, b) => Number(b.id === selectedTownId) - Number(a.id === selectedTownId));
    const occupied: Rect[] = [];
    const next: Record<string, TownCardLayout> = {};

    for (const town of ordered) {
      const point = map.project([town.mapCenter.longitude, town.mapCenter.latitude]);
      const mustExpand = town.id === selectedTownId;
      const canExpand = mustExpand || (!compactViewport && overviewScale);
      let placed: TownCardLayout | null = null;

      if (canExpand) {
        for (const [offsetX, offsetY] of CANDIDATES) {
          const centerX = point.x + offsetX;
          const bottom = point.y + offsetY;
          const rect = {
            left: centerX - CARD_WIDTH / 2,
            right: centerX + CARD_WIDTH / 2,
            top: bottom - CARD_HEIGHT,
            bottom,
          };
          const inBounds = rect.left >= VIEWPORT_PADDING
            && rect.right <= canvas.clientWidth - VIEWPORT_PADDING
            && rect.top >= 72
            && rect.bottom <= canvas.clientHeight - 128;
          if (inBounds && !occupied.some((item) => overlaps(rect, item))) {
            occupied.push(rect);
            placed = { townId: town.id, mode: 'card', offsetX, offsetY };
            break;
          }
        }
      }

      next[town.id] = placed ?? { townId: town.id, mode: 'node', offsetX: 0, offsetY: 0 };
    }

    setLayouts(next);
  }, [enabled, mapRef, selectedTownId, towns]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !enabled) return;
    recalculate();
    map.on('move', recalculate);
    map.on('resize', recalculate);
    return () => {
      map.off('move', recalculate);
      map.off('resize', recalculate);
    };
  }, [enabled, mapRef, recalculate]);

  return { layouts, recalculate };
}
