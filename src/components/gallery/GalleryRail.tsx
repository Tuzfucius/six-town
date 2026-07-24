import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
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
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onOpen: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function GalleryRail({
  images,
  activeIndex,
  onActiveIndexChange,
  onOpen,
}: GalleryRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const draggedDistance = useRef(0);
  const dragStartPosition = useRef(0);
  const wheelTimer = useRef<number | null>(null);
  const isInputActive = useRef(false);
  const lastReportedIndex = useRef(activeIndex);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const reduceMotion = Boolean(useReducedMotion());
  const position = useMotionValue(activeIndex);
  const spreadTarget = useMotionValue(1);
  const spread = useSpring(spreadTarget, {
    stiffness: reduceMotion ? 1000 : 280,
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
      ? clamp(viewportWidth * 0.62, 184, 242)
      : clamp(viewportWidth * 0.2, 230, 320)
  ), [viewportWidth]);
  const cardHeight = cardWidth * 1.25;
  const compactSpacing = cardWidth + 12;

  useEffect(() => position.on('change', (value) => {
    const nextIndex = clamp(Math.round(value), 0, images.length - 1);
    if (nextIndex === lastReportedIndex.current) return;
    lastReportedIndex.current = nextIndex;
    onActiveIndexChange(nextIndex);
  }), [images.length, onActiveIndexChange, position]);

  useEffect(() => {
    lastReportedIndex.current = activeIndex;
    if (!isInputActive.current && Math.round(position.get()) !== activeIndex) {
      position.set(activeIndex);
    }
  }, [activeIndex, position]);

  useEffect(() => {
    const preload = (source: string) => {
      const image = new Image();
      image.src = source;
    };
    images.slice(Math.max(0, activeIndex - 10), activeIndex + 11).forEach((image) => preload(image.thumbnailSrc));
    images.slice(Math.max(0, activeIndex - 1), activeIndex + 2).forEach((image) => preload(image.displaySrc));
  }, [activeIndex, images]);

  useEffect(() => () => {
    if (wheelTimer.current !== null) window.clearTimeout(wheelTimer.current);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      isInputActive.current = true;
      spreadTarget.set(0);
      position.set(clamp(position.get() + delta / 125, 0, images.length - 1));
      if (wheelTimer.current !== null) window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        const target = clamp(Math.round(position.get()), 0, images.length - 1);
        spreadTarget.set(1);
        void animate(position, target, {
          type: reduceMotion ? 'tween' : 'spring',
          duration: reduceMotion ? 0 : undefined,
          stiffness: 330,
          damping: 34,
        }).then(() => {
          position.set(target);
          isInputActive.current = false;
          lastReportedIndex.current = target;
          onActiveIndexChange(target);
        });
      }, 120);
    };
    viewport.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleNativeWheel);
  }, [images.length, onActiveIndexChange, position, reduceMotion, spreadTarget]);

  const focusActiveCard = () => {
    window.requestAnimationFrame(() => {
      viewportRef.current?.querySelector<HTMLButtonElement>('.gallery-card[aria-current="true"]')?.focus();
    });
  };

  const settle = () => {
    const target = clamp(Math.round(position.get()), 0, images.length - 1);
    spreadTarget.set(1);
    void animate(position, target, {
      type: reduceMotion ? 'tween' : 'spring',
      duration: reduceMotion ? 0 : undefined,
      stiffness: 330,
      damping: 34,
    }).then(() => {
      position.set(target);
      isInputActive.current = false;
      lastReportedIndex.current = target;
      onActiveIndexChange(target);
    });
  };

  const moveToIndex = (index: number, focus = false) => {
    const target = clamp(index, 0, images.length - 1);
    spreadTarget.set(1);
    isInputActive.current = false;
    lastReportedIndex.current = target;
    onActiveIndexChange(target);
    void animate(position, target, {
      type: reduceMotion ? 'tween' : 'spring',
      duration: reduceMotion ? 0 : undefined,
      stiffness: 330,
      damping: 34,
    }).then(() => {
      position.set(target);
      if (focus) focusActiveCard();
    });
  };

  const handlePanStart = () => {
    draggedDistance.current = 0;
    dragStartPosition.current = position.get();
    isInputActive.current = true;
    spreadTarget.set(0);
  };

  const handlePan = (_event: PointerEvent, info: PanInfo) => {
    draggedDistance.current = Math.max(draggedDistance.current, Math.abs(info.offset.x));
    position.set(clamp(dragStartPosition.current - info.offset.x / compactSpacing, 0, images.length - 1));
  };

  const handlePanEnd = () => {
    settle();
    window.setTimeout(() => {
      draggedDistance.current = 0;
    }, reduceMotion ? 0 : 180);
  };

  const handleRailClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.detail === 0) return;
    if (draggedDistance.current > 6) return;

    const viewport = viewportRef.current;
    if (!viewport) return;
    const candidate = Array.from(
      viewport.querySelectorAll<HTMLButtonElement>('[data-gallery-card-index]'),
    )
      .map((card) => ({
        index: Number(card.dataset.galleryCardIndex),
        bounds: card.getBoundingClientRect(),
      }))
      .filter(({ bounds }) => (
        event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom
      ))
      .sort((first, second) => (
        Math.abs(event.clientX - (first.bounds.left + first.bounds.right) / 2)
        - Math.abs(event.clientX - (second.bounds.left + second.bounds.right) / 2)
      ))[0]?.index;

    if (candidate === undefined) return;

    event.preventDefault();
    event.stopPropagation();
    if (candidate === activeIndex) onOpen();
    else moveToIndex(candidate);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    moveToIndex(activeIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
  };

  return (
    <div
      ref={viewportRef}
      className="gallery-viewport"
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="实践影像轨道"
    >
      <div onClickCapture={handleRailClick}>
        <motion.div
          className="gallery-rail"
          style={{ height: Math.min(cardHeight * 1.42, viewportWidth < 640 ? 430 : 590) }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
        >
          {images.map((image, index) => (
            <GalleryCard
              key={image.id}
              image={image}
              index={index}
              activeIndex={activeIndex}
              position={position}
              spread={spread}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              reduceMotion={reduceMotion}
              canSelect={() => draggedDistance.current <= 6}
              onSelect={() => moveToIndex(index)}
              onOpen={onOpen}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
