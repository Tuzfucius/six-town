import { useCallback, useState } from 'react';
import { ArrowLeft, Layers3, Maximize2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { galleryImages } from '../data/gallery.generated';
import InteractiveBackground from './InteractiveBackground';
import GalleryLightbox from './gallery/GalleryLightbox';
import GalleryRail from './gallery/GalleryRail';

type GalleryMode = 'stack' | 'focus';

export default function GalleryView() {
  const navigate = useNavigate();
  const reduceMotion = Boolean(useReducedMotion());
  const [mode, setMode] = useState<GalleryMode>('stack');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeImage = galleryImages[activeIndex];

  const previous = useCallback(() => {
    setActiveIndex((index) => Math.max(0, index - 1));
  }, []);
  const next = useCallback(() => {
    setActiveIndex((index) => Math.min(galleryImages.length - 1, index + 1));
  }, []);
  const closeLightbox = useCallback(() => setIsLightboxOpen(false), []);

  return (
    <InteractiveBackground>
      <main className="relative flex h-full min-h-0 flex-col overflow-hidden bg-black/20">
        <header className="relative z-30 flex items-start justify-between px-5 pt-5 sm:px-8 sm:pt-8 md:px-12 md:pt-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex h-11 items-center gap-2 rounded-md border border-white/15 bg-black/25 px-3 text-sm text-white/65 backdrop-blur-md transition-colors hover:border-white/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            返回首页
          </button>

          <div className="absolute left-1/2 top-6 -translate-x-1/2 text-center sm:top-8 md:top-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-cyan-100/50">Field Notes</p>
            <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">实践影像</h1>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'focus' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('stack')}
                  className="gallery-toolbar-button"
                  aria-label="返回层叠视图"
                  title="层叠视图"
                >
                  <Layers3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="gallery-toolbar-button"
                  aria-label="放大当前图片"
                  title="放大"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </header>

        <section className="relative flex min-h-0 flex-1 items-center" aria-labelledby="gallery-status">
          <GalleryRail
            images={galleryImages}
            mode={mode}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            onFocus={() => setMode('focus')}
            onOpen={() => setIsLightboxOpen(true)}
          />
        </section>

        <motion.footer
          id="gallery-status"
          className="relative z-30 flex items-end justify-between px-5 pb-5 sm:px-8 sm:pb-8 md:px-12 md:pb-10"
          layout
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        >
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-white/45">{activeImage.date}</p>
            <p className="mt-1 text-sm text-white/75">{activeImage.location || '实践调研'}</p>
          </div>
          <p className="font-mono text-sm tabular-nums text-white/55">
            {String(activeImage.index).padStart(2, '0')}
            <span className="mx-2 text-white/20">/</span>
            {String(galleryImages.length).padStart(2, '0')}
          </p>
        </motion.footer>
      </main>

      <AnimatePresence>
        {isLightboxOpen && (
          <GalleryLightbox
            image={activeImage}
            total={galleryImages.length}
            hasPrevious={activeIndex > 0}
            hasNext={activeIndex < galleryImages.length - 1}
            onPrevious={previous}
            onNext={next}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </InteractiveBackground>
  );
}
