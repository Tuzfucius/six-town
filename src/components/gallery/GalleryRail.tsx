import { useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type PanInfo,
} from 'motion/react';
import type { GalleryImage } from '../../types/gallery';
import GalleryCard from './GalleryCard';

interface GalleryRailProps {
  images: readonly GalleryImage[];
  mode: 'stack' | 'focus';
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onFocus: () => void;
  onOpen: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function GalleryRail({
  images,
  mode,
  activeIndex,
  onActiveIndexChange,
  onFocus,
  onOpen,
}: GalleryRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const draggedDistance = useRef(0);
  const isSettling = useRef(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const reduceMotion = Boolean(useReducedMotion());
  const railX = useMotionValue(0);
  const compressionTarget = useMotionValue(0);
  const compression = useSpring(compressionTarget, {
    stiffness: reduceMotion ? 1000 : 260,
    damping: reduceMotion ? 100 : 30,
  });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const cardWidth = useMemo(() => (
    viewportWidth < 640
      ? clamp(viewportWidth * 0.56, 176, 232)
      : clamp(viewportWidth * 0.215, 220, 310)
  ), [viewportWidth]);
  const cardHeight = cardWidth * 1.25;
  const restSpacing = mode === 'focus' ? cardWidth + 24 : Math.max(54, cardWidth * 0.34);

  const selectIndex = (index: number) => {
    if (draggedDistance.current > 6 || isSettling.current) return;
    onActiveIndexChange(index);
    if (mode === 'stack') onFocus();
  };

  const moveActiveIndex = (index: number) => {
    onActiveIndexChange(index);
    window.requestAnimationFrame(() => {
      viewportRef.current?.querySelector<HTMLButtonElement>('.gallery-card[aria-current="true"]')?.focus();
    });
  };

  const handlePanStart = () => {
    draggedDistance.current = 0;
    isSettling.current = false;
  };

  const handlePan = (_event: PointerEvent, info: PanInfo) => {
    draggedDistance.current = Math.max(draggedDistance.current, Math.abs(info.offset.x));
    railX.set(info.offset.x);
    if (!reduceMotion) compressionTarget.set(clamp(Math.abs(info.velocity.x) / 1800, 0, 1));
  };

  const handlePanEnd = (_event: PointerEvent, info: PanInfo) => {
    compressionTarget.set(0);
    if (draggedDistance.current <= 6) {
      railX.set(0);
      draggedDistance.current = 0;
      return;
    }
    const projectedOffset = info.offset.x + (reduceMotion ? 0 : info.velocity.x * 0.16);
    const maxStep = mode === 'focus' ? 5 : 9;
    const step = clamp(Math.round(-projectedOffset / restSpacing), -maxStep, maxStep);
    const nextIndex = clamp(activeIndex + step, 0, images.length - 1);
    const actualStep = nextIndex - activeIndex;
    isSettling.current = true;
    void animate(railX, -actualStep * restSpacing, {
      type: reduceMotion ? 'tween' : 'spring',
      duration: reduceMotion ? 0 : undefined,
      stiffness: 280,
      damping: 32,
    }).then(() => {
      moveActiveIndex(nextIndex);
      railX.set(0);
      window.setTimeout(() => {
        draggedDistance.current = 0;
        isSettling.current = false;
      }, 0);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    moveActiveIndex(clamp(activeIndex + direction, 0, images.length - 1));
  };

  return (
    <div
      ref={viewportRef}
      className="gallery-viewport"
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="实践影像轨道"
    >
      <motion.div
        className="gallery-rail"
        style={{ x: railX, height: Math.min(cardHeight * 1.36, viewportWidth < 640 ? 430 : 590) }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        {images.map((image, index) => (
          <GalleryCard
            key={image.id}
            image={image}
            delta={index - activeIndex}
            mode={mode}
            compression={compression}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            isActive={index === activeIndex}
            reduceMotion={reduceMotion}
            onFocus={() => onActiveIndexChange(index)}
            onSelect={() => selectIndex(index)}
            onOpen={onOpen}
          />
        ))}
      </motion.div>
    </div>
  );
}
