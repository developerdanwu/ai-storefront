import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const SLIDE_DURATION = 6000; // 6 seconds per slide

interface StoryProgressProps {
  total: number;
  current: number;
  isPaused?: boolean;
  onSegmentClick?: (index: number) => void;
  onComplete?: () => void;
}

export function StoryProgress({
  total,
  current,
  isPaused = false,
  onSegmentClick,
  onComplete,
}: StoryProgressProps) {
  const [progress, setProgress] = useState(0);

  // Animate progress for current slide
  useEffect(() => {
    // Reset progress when slide changes
    setProgress(0);

    if (isPaused) return;

    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        onComplete?.();
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [current, isPaused, onComplete]);

  return (
    <div
      className="flex w-full items-center gap-1 px-2"
      onClick={(e) => e.stopPropagation()}
    >
      {Array.from({ length: total }).map((_, index) => {
        // Determine the fill state for each segment
        let fillValue: number;
        if (index < current) {
          // Previous slides are fully filled
          fillValue = 100;
        } else if (index === current) {
          // Current slide shows animated progress
          fillValue = progress;
        } else {
          // Future slides are empty
          fillValue = 0;
        }

        return (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSegmentClick?.(index);
            }}
            className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/30 transition-transform hover:scale-y-150"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Progress fill */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full bg-white",
                index === current && !isPaused && "transition-none"
              )}
              style={{
                width: `${fillValue}%`,
                transition: index === current ? "none" : "width 0.3s ease-out",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

export { SLIDE_DURATION };
