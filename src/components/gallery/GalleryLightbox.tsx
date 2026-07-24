import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import type { GalleryImage } from '../../types/gallery';

interface GalleryLightboxProps {
  image: GalleryImage;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function GalleryLightbox({
  image,
  total,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onClose,
}: GalleryLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const reduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && hasPrevious) onPrevious();
      if (event.key === 'ArrowRight' && hasNext) onNext();
      if (event.key === 'Tab') {
        const controls = Array.from(document.querySelectorAll<HTMLElement>('[data-lightbox-control]'))
          .filter((element) => !element.hasAttribute('disabled'));
        if (!controls.length) return;
        const current = controls.indexOf(document.activeElement as HTMLElement);
        const next = event.shiftKey
          ? (current <= 0 ? controls.length - 1 : current - 1)
          : (current >= controls.length - 1 ? 0 : current + 1);
        event.preventDefault();
        controls[next]?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [hasNext, hasPrevious, onClose, onNext, onPrevious]);

  const handleDragEnd = (_event: PointerEvent, info: PanInfo) => {
    const intent = info.offset.x + info.velocity.x * 0.12;
    if (intent < -80 && hasNext) onNext();
    if (intent > 80 && hasPrevious) onPrevious();
  };

  const detail = [image.date, image.location].filter(Boolean).join(' · ');

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`第 ${image.index} 张实践影像`}
      className="fixed inset-0 z-[80] grid grid-rows-[auto_1fr_auto] bg-black/95 p-4 backdrop-blur-xl md:p-8"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between text-sm text-white/55">
        <span>{String(image.index).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <button
          ref={closeButtonRef}
          data-lightbox-control
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-md border border-white/15 bg-black/30 text-white/70 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          aria-label="关闭大图"
          title="关闭"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={image.id}
            src={image.displaySrc}
            alt={`${detail || '实践调研'}影像`}
            width={image.width}
            height={image.height}
            draggable={false}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: reduceMotion ? 0 : 0.24 }}
            className="h-full w-full cursor-grab select-none object-contain active:cursor-grabbing"
          />
        </AnimatePresence>

        <button
          data-lightbox-control
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="gallery-lightbox-nav left-0"
          aria-label="上一张"
          title="上一张"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          data-lightbox-control
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="gallery-lightbox-nav right-0"
          aria-label="下一张"
          title="下一张"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="pt-4 text-center">
        <p className="text-sm font-medium tracking-widest text-white/80">{detail || '实践调研影像'}</p>
      </div>
    </motion.div>
  );
}
