import { useAuth } from "@workos-inc/authkit-react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { ActivityCard } from "./_components/activity-card";
import { IntroCard } from "./_components/intro-card";
import { LanguagesCard } from "./_components/languages-card";
import { ReposCard } from "./_components/repos-card";
import { StarsCard } from "./_components/stars-card";
import { StoryProgress } from "./_components/story-progress";
import { SummaryCard } from "./_components/summary-card";
import {
  useGitHubStats,
  useGitHubUsername,
} from "./_components/use-github-stats";
import { UsernameInput } from "./_components/username-input";

const TOTAL_SLIDES = 6;

export default function WrappedRoute() {
  const { isLoading: authLoading, user: authUser, signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get GitHub username for authenticated users
  const { username: githubUsername, fetchUsername } = useGitHubUsername();

  const {
    user,
    repoStats,
    languageStats,
    activityStats,
    contributionCalendar,
    isLoading,
    isError,
    error,
  } = useGitHubStats(username);

  // Handle username submission (from input or authenticated user)
  const handleUsernameSubmit = useCallback((submittedUsername: string) => {
    setUsername(submittedUsername);
    setHasStarted(true);
    setCurrentSlide(0);
  }, []);

  // Handle sign in with GitHub
  // Note: WorkOS AuthKit handles provider selection - signIn() redirects to WorkOS login
  const handleSignIn = useCallback(() => {
    signIn();
  }, [signIn]);

  // Reset timer - briefly pause then resume
  const resetTimer = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 100);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOTAL_SLIDES) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      resetTimer();
    },
    [currentSlide, resetTimer]
  );

  const nextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
      resetTimer();
    }
  }, [currentSlide, resetTimer]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
      resetTimer();
    }
  }, [currentSlide, resetTimer]);

  // Auto-advance when progress completes
  const handleProgressComplete = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  // Keyboard navigation (only when viewing slides)
  // useEffect(() => {
  //   if (!hasStarted || isLoading) return;

  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "ArrowRight" || e.key === " ") {
  //       e.preventDefault();
  //       nextSlide();
  //     } else if (e.key === "ArrowLeft") {
  //       e.preventDefault();
  //       prevSlide();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [hasStarted, isLoading, nextSlide, prevSlide]);

  // Cleanup timeout on unmount
  // useEffect(() => {
  //   return () => {
  //     if (pauseTimeoutRef.current) {
  //       clearTimeout(pauseTimeoutRef.current);
  //     }
  //   };
  // }, []);

  // Show username input page if not started
  if (!hasStarted) {
    return (
      <UsernameInput
        onSubmit={handleUsernameSubmit}
        onSignIn={handleSignIn}
        isLoading={authLoading}
        isAuthenticated={!!authUser}
        authenticatedUsername={githubUsername ?? undefined}
      />
    );
  }

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
              onClick={() => {
                setHasStarted(false);
                setUsername("");
              }}
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
          className="relative h-full w-full"
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
            <LanguagesCard
              languageStats={languageStats}
              direction={direction}
            />
            {/* <IntroCard user={user} direction={direction} />; */}
            {/* <div key={currentSlide}>{renderSlide()}</div> */}
          </AnimatePresence>
        </div>
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
