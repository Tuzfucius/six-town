import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import { globeProjection, globeSky } from './data/mapStyles';

export type IntroStage = 'loading' | 'globe' | 'eastChina' | 'approaching' | 'revealing' | 'ready';

const SESSION_KEY = 'six-town-metro-intro-seen';
const FINAL_VIEW = { center: [120.32, 30.42] as [number, number], zoom: 8.15, pitch: 24, bearing: -8 };

const setGesturesEnabled = (map: MapLibreMap, enabled: boolean) => {
  const action = enabled ? 'enable' : 'disable';
  map.boxZoom[action]();
  map.doubleClickZoom[action]();
  map.dragPan[action]();
  map.dragRotate[action]();
  map.keyboard[action]();
  map.scrollZoom[action]();
  map.touchZoomRotate[action]();
};

interface UseMetroIntroOptions {
  enabled: boolean;
  reduceMotion: boolean;
}

export function useMetroIntro({ enabled, reduceMotion }: UseMetroIntroOptions) {
  const [stage, setStage] = useState<IntroStage>('loading');
  const cancelledRef = useRef(false);
  const activeMapRef = useRef<MapLibreMap | null>(null);

  const applyGlobe = useCallback((map: MapLibreMap) => {
    map.setProjection(globeProjection);
    map.setSky(globeSky);
  }, []);

  const finish = useCallback((map: MapLibreMap, remember = true) => {
    map.stop();
    applyGlobe(map);
    map.jumpTo(FINAL_VIEW);
    setGesturesEnabled(map, true);
    if (remember) sessionStorage.setItem(SESSION_KEY, '1');
    setStage('ready');
  }, [applyGlobe]);

  const moveTo = useCallback((map: MapLibreMap, options: Parameters<MapLibreMap['easeTo']>[0]) => new Promise<void>((resolve) => {
    const handleMoveEnd = () => {
      map.off('moveend', handleMoveEnd);
      resolve();
    };
    map.on('moveend', handleMoveEnd);
    map.easeTo(options);
  }), []);

  const start = useCallback(async (mapRef: MapRef) => {
    const map = mapRef.getMap();
    activeMapRef.current = map;
    cancelledRef.current = false;
    applyGlobe(map);

    const hasPlayed = sessionStorage.getItem(SESSION_KEY) === '1';
    if (!enabled || reduceMotion || hasPlayed) {
      finish(map, enabled && !hasPlayed);
      return;
    }

    setGesturesEnabled(map, false);
    map.jumpTo({ center: [72, 20], zoom: 0.9, pitch: 0, bearing: 0 });
    setStage('globe');

    await moveTo(map, { center: [105, 28], zoom: 2.15, pitch: 0, bearing: 0, duration: 2100, essential: false });
    if (cancelledRef.current) return;
    setStage('eastChina');

    await moveTo(map, { center: [116.6, 29.8], zoom: 4.65, pitch: 18, bearing: -4, duration: 1900, essential: false });
    if (cancelledRef.current) return;
    setStage('approaching');

    await moveTo(map, { ...FINAL_VIEW, duration: 2300, essential: false });
    if (cancelledRef.current) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    setStage('revealing');
  }, [applyGlobe, enabled, finish, moveTo, reduceMotion]);

  const completeReveal = useCallback(() => {
    const map = activeMapRef.current;
    if (!map || stage !== 'revealing') return;
    setGesturesEnabled(map, true);
    setStage('ready');
  }, [stage]);

  const skip = useCallback(() => {
    cancelledRef.current = true;
    const map = activeMapRef.current;
    if (map) finish(map);
  }, [finish]);

  useEffect(() => () => {
    cancelledRef.current = true;
    const map = activeMapRef.current;
    if (map) {
      map.stop();
      setGesturesEnabled(map, true);
    }
  }, []);

  return {
    stage,
    isInteractive: stage === 'ready',
    isIntroActive: !['loading', 'ready'].includes(stage),
    start,
    skip,
    completeReveal,
    applyGlobe,
  };
}
