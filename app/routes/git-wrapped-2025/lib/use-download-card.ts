import { toPng } from "html-to-image";
import { type RefObject, useCallback, useState } from "react";
import { toast } from "sonner";

// Fixed render size for consistent output (mobile-like dimensions)
const RENDER_WIDTH = 450;
const RENDER_HEIGHT = 780;
// Output at 2x for high quality
const PIXEL_RATIO = 2;

/**
 * Copies all stylesheets from the parent document to an iframe document.
 */
function copyStylesToIframe(iframeDoc: Document) {
  // Copy all <style> tags
  document.querySelectorAll("style").forEach((style) => {
    const clonedStyle = iframeDoc.createElement("style");
    clonedStyle.textContent = style.textContent;
    iframeDoc.head.appendChild(clonedStyle);
  });

  // Copy all <link rel="stylesheet"> tags
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const clonedLink = iframeDoc.createElement("link");
    clonedLink.rel = "stylesheet";
    clonedLink.href = (link as HTMLLinkElement).href;
    iframeDoc.head.appendChild(clonedLink);
  });
}

/**
 * Waits for all stylesheets in the iframe to load.
 */
function waitForStylesheets(iframeDoc: Document): Promise<void> {
  const links = iframeDoc.querySelectorAll('link[rel="stylesheet"]');
  const promises = Array.from(links).map(
    (link) =>
      new Promise<void>((resolve) => {
        if ((link as HTMLLinkElement).sheet) {
          resolve();
        } else {
          link.addEventListener("load", () => resolve());
          link.addEventListener("error", () => resolve());
        }
      })
  );
  return Promise.all(promises).then(() => {});
}

export function useDownloadCard(
  cardRef: RefObject<HTMLDivElement | null>,
  username: string,
  slideName: string
) {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async () => {
    if (!cardRef.current) {
      toast.error("Unable to capture card");
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading("Generating image...");

    let iframe: HTMLIFrameElement | null = null;

    try {
      // Create a hidden iframe with fixed dimensions
      // This gives us an isolated viewport where media queries respond to iframe size
      iframe = document.createElement("iframe");
      iframe.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${RENDER_WIDTH}px;
        height: ${RENDER_HEIGHT}px;
        border: none;
        pointer-events: none;
        visibility: hidden;
      `;
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) {
        throw new Error("Could not access iframe document");
      }

      // Set up the iframe document
      iframeDoc.open();
      iframeDoc.write("<!DOCTYPE html><html><head></head><body></body></html>");
      iframeDoc.close();

      // Copy styles from parent document
      copyStylesToIframe(iframeDoc);

      // Copy any class from html/body (e.g., dark mode)
      iframeDoc.documentElement.className = document.documentElement.className;
      iframeDoc.body.className = document.body.className;

      // Clone the card into the iframe
      const clone = cardRef.current.cloneNode(true) as HTMLElement;
      clone.style.cssText = `
        width: ${RENDER_WIDTH}px;
        height: ${RENDER_HEIGHT}px;
        border-radius: 0;
        transform: none;
        overflow: hidden;
      `;
      iframeDoc.body.style.margin = "0";
      iframeDoc.body.style.padding = "0";
      iframeDoc.body.style.overflow = "hidden";
      iframeDoc.body.appendChild(clone);

      // Wait for stylesheets to load
      await waitForStylesheets(iframeDoc);

      // Additional wait for rendering
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(clone, {
        quality: 1,
        pixelRatio: PIXEL_RATIO,
        cacheBust: true,
        width: RENDER_WIDTH,
        height: RENDER_HEIGHT,
      });

      // Trigger download
      const link = document.createElement("a");
      link.download = `git-wrapped-2025-${username}-${slideName}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Image downloaded!", { id: toastId });
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image", { id: toastId });
    } finally {
      // Clean up
      if (iframe) {
        document.body.removeChild(iframe);
      }
      setIsDownloading(false);
    }
  }, [cardRef, username, slideName]);

  return { download, isDownloading };
}
