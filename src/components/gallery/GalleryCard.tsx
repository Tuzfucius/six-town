import { Maximize2 } from 'lucide-react';
import { useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import type { GalleryImage } from '../../types/gallery';

interface GalleryCardProps {
  image: GalleryImage;
  index: number;
  activeIndex: number;
  position: MotionValue<number>;
  spread: MotionValue<number>;
  cardWidth: number;
  cardHeight: number;
  reduceMotion: boolean;
  onFocus: () => void;
  onSelect: () => void;
  onOpen: () => void;
}

export default function GalleryCard({
  image,
  index,
  activeIndex,
  position,
  spread,
  cardWidth,
  cardHeight,
  reduceMotion,
  onFocus,
  onSelect,
  onOpen,
}: GalleryCardProps) {
  const isActive = index === activeIndex;
  const width = useMotionValue(cardWidth);

  useEffect(() => {
    width.set(cardWidth);
  }, [cardWidth, width]);

  const x = useTransform([position, spread, width], ([current, expansion, currentWidth]) => {
    const compactSpacing = Number(currentWidth) * 0.56;
    const expandedSpacing = Number(currentWidth) * 0.92 + 28;
    const relative = index - Number(current);
    const spacing = compactSpacing + (expandedSpacing - compactSpacing) * Number(expansion);
    return relative * spacing - Number(currentWidth) / 2;
  });
  const rotateY = useTransform([position, spread], ([current, expansion]) => {
    if (reduceMotion) return 0;
    const relative = index - Number(current);
    const direction = relative === 0 ? 0 : Math.sign(relative);
    return direction * (-9 + 6 * Number(expansion));
  });
  const z = useTransform(position, (current) => 80 - Math.abs(index - current) * 2);
  const springX = useSpring(x, { stiffness: 360, damping: 36, mass: 0.7 });
  const springRotateY = useSpring(rotateY, { stiffness: 360, damping: 36, mass: 0.7 });

  return (
    <motion.button
      type="button"
      aria-label={`查看第 ${image.index} 张实践影像`}
      aria-current={isActive ? 'true' : undefined}
      tabIndex={isActive ? 0 : -1}
      onFocus={onFocus}
      onClick={() => {
        if (isActive) onOpen();
        else onSelect();
      }}
      className={`gallery-card group ${isActive ? 'is-active' : ''}`}
      style={{
        x: reduceMotion ? x : springX,
        rotateY: reduceMotion ? 0 : springRotateY,
        width: cardWidth,
        height: cardHeight,
        marginTop: -cardHeight / 2,
        zIndex: z,
        z: reduceMotion ? 0 : z,
      }}
    >
      <img
        src={isActive ? image.displaySrc : image.thumbnailSrc}
        alt=""
        width={isActive ? image.width : 640}
        height={isActive ? image.height : 800}
        loading="lazy"
        draggable={false}
        className={isActive ? 'object-contain' : 'object-cover'}
      />
      <span className="gallery-card-shade" aria-hidden="true" />
      <span className="gallery-card-index" aria-hidden="true">
        {String(image.index).padStart(2, '0')}
      </span>
      {isActive && (
        <span className="gallery-card-expand" aria-hidden="true">
          <Maximize2 className="h-4 w-4" />
        </span>
      )}
    </motion.button>
  );
}
