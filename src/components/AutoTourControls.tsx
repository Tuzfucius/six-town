import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import type { AutoTourStatus } from '../useAutoTour';

interface AutoTourControlsProps {
  status: AutoTourStatus;
  currentIndex: number;
  itemCount: number;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStop: () => void;
  className?: string;
  itemLabel?: string;
}

const buttonClassName = 'grid h-9 w-9 shrink-0 place-items-center rounded-md text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-35';

export default function AutoTourControls({
  status,
  currentIndex,
  itemCount,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onStop,
  className = '',
  itemLabel = '站点',
}: AutoTourControlsProps) {
  const disabled = itemCount === 0;

  return (
    <section
      aria-label="自动导览控制"
      className={`flex h-12 items-center gap-1 rounded-md border border-white/15 bg-[#07111c]/92 px-1.5 shadow-2xl backdrop-blur ${className}`}
    >
      <button type="button" className={buttonClassName} onClick={onPrevious} disabled={disabled} aria-label="上一站" title="上一站">
        <SkipBack className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${buttonClassName} bg-cyan-200/15 text-cyan-100`}
        onClick={status === 'playing' ? onPause : onPlay}
        disabled={disabled}
        aria-label={status === 'playing' ? '暂停自动导览' : '开始自动导览'}
        title={status === 'playing' ? '暂停自动导览' : '开始自动导览'}
      >
        {status === 'playing' ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
      </button>
      <button type="button" className={buttonClassName} onClick={onNext} disabled={disabled} aria-label="下一站" title="下一站">
        <SkipForward className="h-4 w-4" aria-hidden="true" />
      </button>
      <p className="min-w-20 px-2 text-center text-xs tabular-nums text-white/65" aria-live="polite">
        {itemCount > 0 ? `${itemLabel} ${currentIndex + 1}/${itemCount}` : `暂无${itemLabel}`}
      </p>
      <button type="button" className={buttonClassName} onClick={onStop} disabled={status === 'idle'} aria-label="退出自动导览" title="退出自动导览">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}
