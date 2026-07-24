import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
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
  const wheelIdleTimer = useRef<number | null>(null);
  const wheelVelocity = useRef(0);
  const lastWheelTime = useRef(0);
  const interactionId = useRef(0);
  const isInputActive = useRef(false);
  const lastReportedIndex = useRef(activeIndex);
  const positionAnimation = useRef<{ stop: () => void } | null>(null);
  const targetWheelPosition = useRef<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const reduceMotion = Boolean(useReducedMotion());
  const position = useMotionValue(activeIndex);
  const spread = useMotionValue(1);

  const stopPositionAnimation = () => {
    positionAnimation.current?.stop();
    positionAnimation.current = null;
  };

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
  const maxPosition = Math.max(images.length - 1, 0);

  useEffect(() => position.on('change', (value) => {
    const nextIndex = clamp(Math.round(value), 0, maxPosition);
    if (nextIndex === lastReportedIndex.current) return;
    lastReportedIndex.current = nextIndex;
    onActiveIndexChange(nextIndex);
  }), [maxPosition, onActiveIndexChange, position]);

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
    stopPositionAnimation();
    if (wheelIdleTimer.current !== null) window.clearTimeout(wheelIdleTimer.current);
  }, []);

  const animatePosition = (target: number, focus = false) => {
    stopPositionAnimation();
    const currentInteraction = ++interactionId.current;
    const animation = animate(position, target, {
      type: reduceMotion ? 'tween' : 'tween',
      duration: reduceMotion ? 0 : 0.28,
      ease: [0.16, 1, 0.3, 1],
    });
    positionAnimation.current = animation;
    void animation.then(() => {
      if (currentInteraction !== interactionId.current) return;
      position.set(target);
      positionAnimation.current = null;
      if (focus) focusActiveCard();
    });
  };

  const finishWheel = () => {
    targetWheelPosition.current = null;
    wheelVelocity.current = 0;
    const target = clamp(Math.round(position.get()), 0, maxPosition);
    spread.set(1);
    animatePosition(target);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!rawDelta || !images.length) return;
      event.preventDefault();

      stopPositionAnimation();
      isInputActive.current = true;
      spread.set(0);
      const delta = clamp(rawDelta * (event.deltaMode === 1 ? 16 : 1), -180, 180);
      const deltaPos = delta / compactSpacing;

      if (targetWheelPosition.current === null) {
        targetWheelPosition.current = position.get();
      }
      targetWheelPosition.current = clamp(targetWheelPosition.current + deltaPos, 0, maxPosition);

      const currentInteraction = ++interactionId.current;
      const animation = animate(position, targetWheelPosition.current, {
        type: 'tween',
        duration: reduceMotion ? 0 : 0.22,
        ease: [0.16, 1, 0.3, 1],
      });
      positionAnimation.current = animation;

      if (wheelIdleTimer.current !== null) window.clearTimeout(wheelIdleTimer.current);
      wheelIdleTimer.current = window.setTimeout(() => {
        wheelIdleTimer.current = null;
        if (currentInteraction === interactionId.current) {
          isInputActive.current = false;
          finishWheel();
        }
      }, 120);
    };
    viewport.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleNativeWheel);
  }, [compactSpacing, images.length, maxPosition, position, reduceMotion, spread]);

  const focusActiveCard = () => {
    window.requestAnimationFrame(() => {
      viewportRef.current?.querySelector<HTMLButtonElement>('.gallery-card[aria-current="true"]')?.focus();
    });
  };

  const settleDrag = (velocity = 0) => {
    stopPositionAnimation();
    isInputActive.current = true;
    spread.set(1);

    const currentPos = position.get();
    if (reduceMotion || (Math.abs(velocity) < 0.01 && Math.abs(currentPos - Math.round(currentPos)) < 0.01)) {
      const targetIndex = clamp(Math.round(currentPos), 0, maxPosition);
      position.set(targetIndex);
      isInputActive.current = false;
      return;
    }

    const projectedPosition = currentPos + velocity * 0.28;
    let targetIndex = clamp(Math.round(projectedPosition), 0, maxPosition);
    const currentRounded = Math.round(currentPos);
    if (targetIndex === currentRounded && Math.abs(velocity) > 0.35) {
      targetIndex = clamp(currentRounded + (velocity > 0 ? 1 : -1), 0, maxPosition);
    }

    const currentInteraction = ++interactionId.current;
    lastReportedIndex.current = targetIndex;
    onActiveIndexChange(targetIndex);

    const animation = animate(position, targetIndex, {
      type: reduceMotion ? 'tween' : 'spring',
      stiffness: 220,
      damping: 26,
      mass: 0.8,
      velocity,
    });
    positionAnimation.current = animation;
    void animation.then(() => {
      if (currentInteraction !== interactionId.current) return;
      position.set(targetIndex);
      positionAnimation.current = null;
      isInputActive.current = false;
    });
  };

  const moveToIndex = (index: number, focus = false) => {
    const target = clamp(index, 0, maxPosition);
    isInputActive.current = false;
    lastReportedIndex.current = target;
    onActiveIndexChange(target);
    spread.set(1);
    animatePosition(target, focus);
  };

  const handlePanStart = () => {
    stopPositionAnimation();
    interactionId.current += 1;
    draggedDistance.current = 0;
    dragStartPosition.current = position.get();
    isInputActive.current = true;
    spread.set(0);
  };

  const handlePan = (_event: PointerEvent, info: PanInfo) => {
    draggedDistance.current = Math.max(draggedDistance.current, Math.abs(info.offset.x));
    position.set(clamp(dragStartPosition.current - info.offset.x / compactSpacing, 0, maxPosition));
  };

  const handlePanEnd = (_event: PointerEvent, info: PanInfo) => {
    settleDrag(-info.velocity.x / compactSpacing);
    window.setTimeout(() => {
      draggedDistance.current = 0;
    }, reduceMotion ? 0 : 180);
  };

  const handleRailClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.detail === 0 || draggedDistance.current > 6) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const candidate = Array.from(viewport.querySelectorAll<HTMLButtonElement>('[data-gallery-card-index]'))
      .map((card) => ({ index: Number(card.dataset.galleryCardIndex), bounds: card.getBoundingClientRect() }))
      .filter(({ bounds }) => (
        event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom
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
