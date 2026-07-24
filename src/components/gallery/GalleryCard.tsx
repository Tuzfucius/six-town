import { Maximize2 } from 'lucide-react';
import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type { GalleryImage } from '../../types/gallery';

interface GalleryCardProps {
  image: GalleryImage;
  delta: number;
  mode: 'stack' | 'focus';
  compression: MotionValue<number>;
  cardWidth: number;
  cardHeight: number;
  isActive: boolean;
  reduceMotion: boolean;
  onSelect: () => void;
  onOpen: () => void;
}

export default function GalleryCard({
  image,
  delta,
  mode,
  compression,
  cardWidth,
  cardHeight,
  isActive,
  reduceMotion,
  onSelect,
  onOpen,
}: GalleryCardProps) {
  const stackSpacing = Math.max(54, cardWidth * 0.34);
  const focusSpacing = cardWidth + 24;
  const rawX = useTransform(compression, (value) => {
    const restingSpacing = mode === 'focus' ? focusSpacing : stackSpacing;
    const compressedSpacing = stackSpacing * 0.58;
    return delta * (restingSpacing + (compressedSpacing - restingSpacing) * value) - cardWidth / 2;
  });
  const rawRotateY = useTransform(compression, (value) => {
    if (reduceMotion) return 0;
    const direction = delta === 0 ? 0 : Math.sign(delta);
    const base = mode === 'stack' ? direction * -8 : direction * -2;
    return base + direction * -8 * value;
  });
  const springConfig = { stiffness: 330, damping: 34, mass: 0.72 };
  const x = useSpring(rawX, springConfig);
  const rotateY = useSpring(rawRotateY, springConfig);
  const visibleDistance = mode === 'focus' ? 5 : 12;
  const isVisible = Math.abs(delta) <= visibleDistance;

  const handleClick = () => {
    if (mode === 'focus' && isActive) {
      onOpen();
      return;
    }
    onSelect();
  };

  return (
    <motion.button
      type="button"
      aria-label={`查看第 ${image.index} 张实践影像`}
      aria-current={isActive ? 'true' : undefined}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      className={`gallery-card group ${isActive ? 'is-active' : ''} ${mode === 'focus' ? 'is-focus' : 'is-stack'}`}
      style={{
        x: reduceMotion ? rawX : x,
        rotateY: reduceMotion ? 0 : rotateY,
        width: cardWidth,
        height: cardHeight,
        marginTop: -cardHeight / 2,
        zIndex: isActive ? 1000 : 500 - Math.abs(delta),
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <img
        src={isActive && mode === 'focus' ? image.displaySrc : image.thumbnailSrc}
        alt=""
        width={isActive && mode === 'focus' ? image.width : 640}
        height={isActive && mode === 'focus' ? image.height : 800}
        loading={Math.abs(delta) <= 2 ? 'eager' : 'lazy'}
        draggable={false}
        className={isActive && mode === 'focus' ? 'object-contain' : 'object-cover'}
      />
      <span className="gallery-card-shade" aria-hidden="true" />
      <span className="gallery-card-index" aria-hidden="true">
        {String(image.index).padStart(2, '0')}
      </span>
      {isActive && mode === 'focus' && (
        <span className="gallery-card-expand" aria-hidden="true">
          <Maximize2 className="h-4 w-4" />
        </span>
      )}
    </motion.button>
  );
}
