import { useCallback, useEffect, useRef, useState } from 'react';

export type AutoTourStatus = 'idle' | 'playing' | 'paused';

interface UseAutoTourOptions {
  itemCount: number;
  onVisit: (index: number) => void;
  intervalMs?: number;
}

export function useAutoTour({ itemCount, onVisit, intervalMs = 6000 }: UseAutoTourOptions) {
  const [status, setStatus] = useState<AutoTourStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const onVisitRef = useRef(onVisit);

  useEffect(() => {
    onVisitRef.current = onVisit;
  }, [onVisit]);

  const visit = useCallback((index: number) => {
    if (itemCount <= 0) return;
    const normalizedIndex = (index + itemCount) % itemCount;
    setCurrentIndex(normalizedIndex);
    onVisitRef.current(normalizedIndex);
  }, [itemCount]);

  const play = useCallback(() => {
    if (itemCount <= 0) return;
    if (status === 'idle') visit(currentIndex);
    setStatus('playing');
  }, [currentIndex, itemCount, status, visit]);

  const pause = useCallback(() => {
    setStatus((currentStatus) => currentStatus === 'idle' ? 'idle' : 'paused');
  }, []);

  const pauseForUser = useCallback(() => {
    setStatus((currentStatus) => currentStatus === 'playing' ? 'paused' : currentStatus);
  }, []);

  const stop = useCallback(() => {
    setStatus('idle');
  }, []);

  const next = useCallback(() => {
    setStatus('paused');
    visit(currentIndex + 1);
  }, [currentIndex, visit]);

  const previous = useCallback(() => {
    setStatus('paused');
    visit(currentIndex - 1);
  }, [currentIndex, visit]);

  useEffect(() => {
    if (status !== 'playing' || itemCount <= 1) return;
    const timer = window.setTimeout(() => visit(currentIndex + 1), intervalMs);
    return () => window.clearTimeout(timer);
  }, [currentIndex, intervalMs, itemCount, status, visit]);

  useEffect(() => {
    if (itemCount <= 0) {
      setCurrentIndex(0);
      setStatus('idle');
      return;
    }
    if (currentIndex >= itemCount) setCurrentIndex(itemCount - 1);
  }, [currentIndex, itemCount]);

  return {
    status,
    currentIndex,
    isPlaying: status === 'playing',
    play,
    pause,
    pauseForUser,
    stop,
    next,
    previous,
    visit,
  };
}
