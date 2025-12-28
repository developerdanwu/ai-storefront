import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { MotionGlobalConfig } from "motion/react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ActivityCard } from "~/routes/git-wrapped-2025/_components/activity-card";
import { IntroCard } from "~/routes/git-wrapped-2025/_components/intro-card";
import { LanguagesCard } from "~/routes/git-wrapped-2025/_components/languages-card";
import { ReposCard } from "~/routes/git-wrapped-2025/_components/repos-card";
import { StarsCard } from "~/routes/git-wrapped-2025/_components/stars-card";
import { SummaryCard } from "~/routes/git-wrapped-2025/_components/summary-card";
import { useGitHubStats } from "~/routes/git-wrapped-2025/_components/use-github-stats";

// Fixed render size for consistent output (mobile-like dimensions)
export const RENDER_WIDTH = 450;
export const RENDER_HEIGHT = 780;
// Output at 2x for high quality
const PIXEL_RATIO = 2;

const SLIDE_NAMES = [
  "intro",
  "repos",
  "languages",
  "stars",
  "activity",
  "summary",
] as const;

export type SlideName = (typeof SLIDE_NAMES)[number];

export interface SlideImage {
  name: SlideName;
  imageUrl: string;
}

/**
 * Renders a React component to a PNG data URL
 */
async function renderToImage(
  component: ReactNode,
  slideName: string
): Promise<string> {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = `${RENDER_WIDTH}px`;
  container.style.height = `${RENDER_HEIGHT}px`;
  container.style.overflow = "hidden";

  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(
      <div style={{ width: RENDER_WIDTH, height: RENDER_HEIGHT }}>
        {component}
      </div>
    );

    // Wait for browser to paint
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the actual rendered card element (first child)
    const cardElement = container.firstElementChild as HTMLElement | null;
    if (!cardElement) {
      throw new Error(`Failed to render ${slideName}: No card element found`);
    }

    // Capture the card element
    const dataUrl = await toPng(cardElement, {
      quality: 1,
      pixelRatio: PIXEL_RATIO,
      cacheBust: true,
      width: RENDER_WIDTH,
      height: RENDER_HEIGHT,
    });

    return dataUrl;
  } catch (err) {
    throw new Error(
      `Failed to capture ${slideName}: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

/**
 * Hook that generates image data URLs for all 6 slides
 */
export function useGenerateAllSlideImages({ username }: { username: string }) {
  const {
    user,
    repoStats,
    languageStats,
    activityStats,
    contributionCalendar,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError,
  } = useGitHubStats(username ?? "");

  const {
    data,
    isLoading: isGenerating,
    isError: isGeneratingError,
    error: generatingError,
  } = useQuery({
    throwOnError: false,
    enabled: !isLoadingStats && !isStatsError,
    queryKey: ["all-slide-images", username],
    queryFn: async () => {
      MotionGlobalConfig.skipAnimations = true;

      try {
        const slideComponents: Array<{
          name: SlideName;
          component: ReactNode;
        }> = [
          {
            name: "intro",
            component: <IntroCard user={user} direction={1} />,
          },
          {
            name: "repos",
            component: <ReposCard repoStats={repoStats} direction={1} />,
          },
          {
            name: "languages",
            component: (
              <LanguagesCard languageStats={languageStats} direction={1} />
            ),
          },
          {
            name: "stars",
            component: <StarsCard repoStats={repoStats} direction={1} />,
          },
          {
            name: "activity",
            component: (
              <ActivityCard activityStats={activityStats} direction={1} />
            ),
          },
          {
            name: "summary",
            component: (
              <SummaryCard
                user={user}
                repoStats={repoStats}
                languageStats={languageStats}
                activityStats={activityStats}
                contributionCalendar={contributionCalendar}
                direction={1}
              />
            ),
          },
        ];

        // Generate all images in parallel
        const images = await Promise.all(
          slideComponents.map(async (slide) => {
            console.log(
              `[useGenerateAllSlideImages] Rendering ${slide.name}...`
            );
            const imageUrl = await renderToImage(slide.component, slide.name);
            console.log(
              `[useGenerateAllSlideImages] ${slide.name} captured, length: ${imageUrl.length}`
            );
            return { name: slide.name, imageUrl };
          })
        );

        return images;
      } finally {
        MotionGlobalConfig.skipAnimations = false;
      }
    },
  });

  return {
    images: data,
    isLoading: isLoadingStats || isGenerating,
    isError: isStatsError || isGeneratingError,
    error: generatingError || statsError,
  };
}
