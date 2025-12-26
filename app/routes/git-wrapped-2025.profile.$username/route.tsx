import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { ActivityCard } from "../git-wrapped-2025/_components/activity-card";
import { IntroCard } from "../git-wrapped-2025/_components/intro-card";
import { LanguagesCard } from "../git-wrapped-2025/_components/languages-card";
import { ReposCard } from "../git-wrapped-2025/_components/repos-card";
import { SlideControls } from "../git-wrapped-2025/_components/slide-controls";
import { StarsCard } from "../git-wrapped-2025/_components/stars-card";
import { StoryProgress } from "../git-wrapped-2025/_components/story-progress";
import { SummaryCard } from "../git-wrapped-2025/_components/summary-card";
import { useDownloadCard } from "../git-wrapped-2025/_components/use-download-card";
import { useGitHubStats } from "../git-wrapped-2025/_components/use-github-stats";

const TOTAL_SLIDES = 6;
const SLIDE_NAMES = [
  "intro",
  "repos",
  "languages",
  "stars",
  "activity",
  "summary",
] as const;

export default function GitWrappedProfileRoute() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { download, isDownloading } = useDownloadCard(
    cardRef,
    username ?? "user",
    SLIDE_NAMES[currentSlide]
  );

  const {
    user,
    repoStats,
    languageStats,
    activityStats,
    contributionCalendar,
    isLoading,
    isError,
    error,
  } = useGitHubStats(username ?? "");

  // Toggle pause state manually
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOTAL_SLIDES) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      //   resetTimer();
    },
    [currentSlide]
  );

  const nextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
      //   resetTimer();
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Auto-advance when progress completes
  const handleProgressComplete = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (isLoading) return;

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
  }, [isLoading, nextSlide, prevSlide]);

  // Mobile frame wrapper component
  const MobileFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
      <div className="relative w-full h-full sm:w-[450px] sm:h-auto sm:aspect-[450/780] overflow-hidden sm:rounded-3xl bg-black shadow-2xl shadow-black/50 sm:ring-1 sm:ring-white/10">
        {children}
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <MobileFrame>
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-black">
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-lg">Loading {username}'s GitHub stats...</p>
          </div>
        </div>
      </MobileFrame>
    );
  }

  // Error state
  if (isError) {
    return (
      <MobileFrame>
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-red-900 to-black">
          <div className="flex flex-col items-center gap-4 text-white">
            <p className="text-xl font-bold">Oops! Something went wrong</p>
            <p className="text-white/70">
              {error?.message || "Failed to load GitHub data"}
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
      </MobileFrame>
    );
  }

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <IntroCard user={user} direction={direction} />;
      case 1:
        return <ReposCard repoStats={repoStats} direction={direction} />;
      case 2:
        return (
          <LanguagesCard languageStats={languageStats} direction={direction} />
        );
      case 3:
        return <StarsCard repoStats={repoStats} direction={direction} />;
      case 4:
        return (
          <ActivityCard activityStats={activityStats} direction={direction} />
        );
      case 5:
        return (
          <SummaryCard
            user={user}
            repoStats={repoStats}
            languageStats={languageStats}
            activityStats={activityStats}
            contributionCalendar={contributionCalendar}
            direction={direction}
            onShare={(e) => {
              e.preventDefault();
              e.stopPropagation();
              download();
            }}
            isSharing={isDownloading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
      {/* Navigation arrow - left (outside the box) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="mr-4 hidden h-9 w-9 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-0 sm:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <div className="relative w-full h-full sm:w-[450px] sm:h-auto sm:aspect-[450/780] overflow-hidden sm:rounded-3xl bg-black shadow-2xl shadow-black/50 sm:ring-1 sm:ring-white/10">
        {/* Story progress bars at top */}
        <div className="absolute inset-x-0 top-0 z-20 p-3 pt-4">
          <StoryProgress
            total={TOTAL_SLIDES}
            current={currentSlide}
            isPaused={isPaused}
            onSegmentClick={goToSlide}
            onComplete={handleProgressComplete}
          />
        </div>

        {/* Main card area - tap left/right halves to navigate */}
        <div
          className={
            "sm:pointer-events-none pointer-events-auto relative h-full w-full"
          }
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
        >
          <AnimatePresence mode="wait" custom={direction}>
            <div ref={cardRef} key={currentSlide} className="h-full w-full">
              {renderSlide()}
            </div>
          </AnimatePresence>
        </div>

        {/* Persistent slide controls */}
        <SlideControls
          isPaused={isPaused}
          onTogglePause={togglePause}
          onDownload={download}
          isDownloading={isDownloading}
        />
      </div>

      {/* Navigation arrow - right (outside the box) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        disabled={currentSlide === TOTAL_SLIDES - 1}
        className="ml-4 hidden h-9 w-9 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-0 sm:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
