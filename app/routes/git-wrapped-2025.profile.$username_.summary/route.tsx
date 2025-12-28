import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { useGenerateAllSlideImages } from "./use-generate-all-images";

const TOTAL_SLIDES = 6;

// Phone frame wrapper - same size on all screens, centered
const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-[450px] max-w-[95vw] aspect-[450/780] overflow-hidden rounded-3xl bg-black shadow-2xl shadow-black/50 ring-1 ring-white/10">
    {children}
  </div>
);

export default function GitWrappedSummaryRoute() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { images, isLoading, isError, error } = useGenerateAllSlideImages({
    username: username ?? "",
  });

  const canScrollPrev = currentSlide > 0;
  const canScrollNext = currentSlide < TOTAL_SLIDES - 1;

  const nextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < TOTAL_SLIDES) {
      setCurrentSlide(index);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-neutral-950">
        <PhoneFrame>
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-black">
            <div className="flex flex-col items-center gap-4 text-white">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="text-lg">Generating {username}'s slides...</p>
            </div>
          </div>
        </PhoneFrame>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-neutral-950">
        <PhoneFrame>
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-red-900 to-black">
            <div className="flex flex-col items-center gap-4 text-white">
              <p className="text-xl font-bold">Oops! Something went wrong</p>
              <p className="text-white/70">
                {error?.message || "Failed to load data"}
              </p>
              <button
                type="button"
                onClick={() => navigate("/git-wrapped-2025")}
                className="mt-4 rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
              >
                Try another username
              </button>
            </div>
          </div>
        </PhoneFrame>
      </div>
    );
  }

  const currentImage = images?.[currentSlide];

  // Success state
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-neutral-950">
      {/* Navigation arrow - left (outside the frame) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        disabled={!canScrollPrev}
        className="mr-4 hidden h-9 w-9 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-0 sm:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <PhoneFrame>
        {/* Header with title and instructions */}
        <div className="absolute inset-x-0 top-0 z-20 flex flex-col items-center gap-1 bg-gradient-to-b from-black/80 to-transparent p-4 pt-6">
          <h1 className="text-center text-lg font-bold text-white">
            {username}'s Git Wrapped 2025
          </h1>
          <p className="text-center text-xs text-white/60">
            Long-press or right click to save image
          </p>
        </div>

        {/* Tap zones for navigation - tap left/right halves */}
        <div
          className="absolute inset-0 z-10 sm:pointer-events-none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const halfWidth = rect.width / 2;

            if (clickX < halfWidth) {
              prevSlide();
            } else {
              nextSlide();
            }
          }}
        />

        {/* Current image */}
        {currentImage && (
          <img
            src={currentImage.imageUrl}
            alt={`${username}'s ${currentImage.name} slide`}
            className="h-full w-full object-cover"
          />
        )}

        {/* Bottom controls */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6">
          {/* Slide indicator dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentSlide
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate(`/git-wrapped-2025/profile/${username}`)}
            className="rounded-lg bg-white/10 px-6 py-2 text-sm text-white transition-colors hover:bg-white/20"
          >
            View interactive slides
          </button>
        </div>
      </PhoneFrame>

      {/* Navigation arrow - right (outside the frame) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        disabled={!canScrollNext}
        className="ml-4 hidden h-9 w-9 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-0 sm:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
