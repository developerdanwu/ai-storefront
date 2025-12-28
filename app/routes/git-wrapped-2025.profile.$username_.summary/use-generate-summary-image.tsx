import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { MotionGlobalConfig } from "motion/react";
import { createRoot } from "react-dom/client";
import { SummaryCard } from "~/routes/git-wrapped-2025/_components/summary-card";
import { useGitHubStats } from "~/routes/git-wrapped-2025/_components/use-github-stats";
// Fixed render size for consistent output (mobile-like dimensions)
export const RENDER_WIDTH = 450;
export const RENDER_HEIGHT = 780;
// Output at 2x for high quality
const PIXEL_RATIO = 2;

interface UseGenerateCardImageV2Result {
  imageDataUrl: string | null;
  isGenerating: boolean;
  error: Error | null;
  regenerate: () => void;
}

/**
 * Hook that generates an image data URL by rendering a React component
 * into a detached DOM element using createRoot, capturing it, then unmounting.
 *
 * No hidden card component needed in the component tree!
 */
export function useGenerateSummaryImage({ username }: { username: string }) {
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
    queryKey: ["generate-card-image-v2", username],
    queryFn: async () => {
      MotionGlobalConfig.skipAnimations = true;
      let container: HTMLDivElement | null = null;
      let root: ReturnType<typeof createRoot> | null = null;

      container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = `${RENDER_WIDTH}px`;
      container.style.height = `${RENDER_HEIGHT}px`;
      container.style.overflow = "hidden";

      document.body.appendChild(container);
      root = createRoot(container);

      try {
        root!.render(
          <div style={{ width: RENDER_WIDTH, height: RENDER_HEIGHT }}>
            <SummaryCard
              user={user}
              repoStats={repoStats}
              languageStats={languageStats}
              activityStats={activityStats}
              contributionCalendar={contributionCalendar}
              direction={1}
            />
          </div>
        );

        // Wait for browser to paint
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get the actual rendered card element (first child)
        const cardElement = container.firstElementChild as HTMLElement | null;
        if (!cardElement) {
          throw new Error("No card element rendered in container");
        }

        console.log(
          "[useGenerateCardImageV2] Capturing image from:",
          cardElement.tagName
        );
        console.log(
          "[useGenerateCardImageV2] Card dimensions:",
          cardElement.offsetWidth,
          "x",
          cardElement.offsetHeight
        );

        // Capture the card element (not the container)
        const dataUrl = await toPng(cardElement, {
          quality: 1,
          pixelRatio: PIXEL_RATIO,
          cacheBust: true,
          width: RENDER_WIDTH,
          height: RENDER_HEIGHT,
        });

        console.log(
          "[useGenerateCardImageV2] Image captured, dataUrl length:",
          dataUrl.length
        );

        return { imageUrl: dataUrl };
      } catch (err) {
        console.error("[useGenerateCardImageV2] Error:", err);
        throw err;
      } finally {
        MotionGlobalConfig.skipAnimations = false;
        if (root) {
          root.unmount();
        }
      }
    },
  });

  return {
    data,
    isLoading: isLoadingStats || isGenerating,
    isError: isStatsError || isGeneratingError,
    error: generatingError || statsError,
  };
}
