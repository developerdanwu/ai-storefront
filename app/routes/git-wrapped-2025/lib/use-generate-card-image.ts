import { toPng } from "html-to-image";
import { type RefObject, useCallback, useEffect, useState } from "react";

// Fixed render size for consistent output (mobile-like dimensions)
export const RENDER_WIDTH = 450;
export const RENDER_HEIGHT = 780;
// Output at 2x for high quality
const PIXEL_RATIO = 2;

/**
 * Generates an image data URL from a card element.
 * Captures the element directly without iframe cloning.
 */
async function generateCardImage(cardElement: HTMLDivElement): Promise<string> {
  // Wait for any pending renders
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 100));

  const dataUrl = await toPng(cardElement, {
    quality: 1,
    pixelRatio: PIXEL_RATIO,
    cacheBust: true,
    width: RENDER_WIDTH,
    height: RENDER_HEIGHT,
  });

  return dataUrl;
}

interface UseGenerateCardImageResult {
  imageDataUrl: string | null;
  isGenerating: boolean;
  error: Error | null;
  regenerate: () => void;
}

/**
 * Hook that generates an image data URL from a card ref.
 * Automatically generates the image when the card ref is available and isReady is true.
 */
export function useGenerateCardImage(
  cardRef: RefObject<HTMLDivElement | null>,
  isReady: boolean
): UseGenerateCardImageResult {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const regenerate = useCallback(() => {
    setImageDataUrl(null);
    setError(null);
    setRegenerateKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isReady || !cardRef.current || imageDataUrl) {
      return;
    }

    let cancelled = false;

    const generate = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        // Wait for MotionConfig reducedMotion to take effect and render to complete
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (cancelled || !cardRef.current) {
          return;
        }

        const dataUrl = await generateCardImage(cardRef.current);

        if (!cancelled) {
          setImageDataUrl(dataUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Failed to generate image")
          );
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
  }, [cardRef, isReady, regenerateKey, imageDataUrl]);

  return { imageDataUrl, isGenerating, error, regenerate };
}
