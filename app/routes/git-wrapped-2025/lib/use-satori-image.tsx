import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { useCallback, useEffect, useRef, useState } from "react";
import satori from "satori";
import { toast } from "sonner";

// Card dimensions
const CARD_WIDTH = 450;
const CARD_HEIGHT = 780;

// Contribution level colors
const LEVEL_COLORS = [
  "#0a0f18", // Level 0 - no contributions
  "#064e3b", // Level 1 - emerald-900
  "#059669", // Level 2 - emerald-600
  "#34d399", // Level 3 - emerald-400
  "#6ee7b7", // Level 4 - emerald-300
];

function getContributionLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// Types
interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface SummaryCardData {
  username: string;
  avatarUrl?: string;
  displayName?: string;
  totalRepos: number;
  totalStars: number;
  totalContributions: number;
  topLanguage?: string;
  contributionCalendar?: ContributionCalendar;
}

// WASM initialization state
let wasmInitialized = false;
let wasmInitPromise: Promise<void> | null = null;

async function ensureWasmInitialized(): Promise<void> {
  if (wasmInitialized) return;
  if (wasmInitPromise) return wasmInitPromise;

  wasmInitPromise = (async () => {
    const wasmResponse = await fetch("/resvg.wasm");
    await initWasm(wasmResponse);
    wasmInitialized = true;
  })();

  return wasmInitPromise;
}

// Font loading
let fontData: ArrayBuffer | null = null;
let fontBoldData: ArrayBuffer | null = null;
let fontLoadPromise: Promise<void> | null = null;

async function ensureFontsLoaded(): Promise<void> {
  if (fontData && fontBoldData) return;
  if (fontLoadPromise) return fontLoadPromise;

  fontLoadPromise = (async () => {
    const [regular, bold] = await Promise.all([
      fetch(
        "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwY.woff"
      ).then((res) => res.arrayBuffer()),
      fetch(
        "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcvuYgY.woff"
      ).then((res) => res.arrayBuffer()),
    ]);
    fontData = regular;
    fontBoldData = bold;
  })();

  return fontLoadPromise;
}

// Contribution heatmap component for Satori
function ContributionGrid({ calendar }: { calendar: ContributionCalendar }) {
  // Calculate max count for color scaling
  let maxCount = 0;
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > maxCount) {
        maxCount = day.contributionCount;
      }
    }
  }

  return (
    <div style={{ display: "flex", gap: 2 }}>
      {calendar.weeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          style={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {week.contributionDays.map((day) => {
            const level = getContributionLevel(day.contributionCount, maxCount);
            return (
              <div
                key={day.date}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: LEVEL_COLORS[level],
                  boxShadow:
                    level > 0 ? "0 0 4px rgba(16,185,129,0.3)" : undefined,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// The summary card component for Satori rendering
function SummaryCardSatori({ data }: { data: SummaryCardData }) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: "linear-gradient(135deg, #030712 0%, #0a1628 100%)",
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(6, 182, 212, 0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(16, 185, 129, 0.12)",
        }}
      />

      {/* Main content box */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          padding: 24,
          borderRadius: 16,
          border: "1px solid rgba(6, 182, 212, 0.2)",
          background: "rgba(10, 16, 24, 0.8)",
          boxShadow: "0 0 40px rgba(6, 182, 212, 0.08)",
        }}
      >
        {/* Avatar */}
        {data.avatarUrl && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: -60,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                padding: 3,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #d946ef 100%)",
                display: "flex",
              }}
            >
              <div
                style={{
                  padding: 4,
                  borderRadius: "50%",
                  background: "#0a0f18",
                  display: "flex",
                }}
              >
                <img
                  src={data.avatarUrl}
                  width={64}
                  height={64}
                  style={{ borderRadius: "50%" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Username */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "white",
            marginBottom: 24,
            letterSpacing: "0.02em",
          }}
        >
          {data.displayName || data.username}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            paddingLeft: 8,
            paddingRight: 8,
            marginBottom: 24,
          }}
        >
          {/* Repos */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              {formatNumber(data.totalRepos)}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              REPOS
            </div>
          </div>

          {/* Stars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              {formatNumber(data.totalStars)}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              STARS
            </div>
          </div>

          {/* Contributions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              {formatNumber(data.totalContributions)}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              CONTRIBUTIONS
            </div>
          </div>
        </div>

        {/* Language badge */}
        {data.topLanguage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#22d3ee",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid rgba(6, 182, 212, 0.3)",
                background: "rgba(8, 145, 178, 0.3)",
              }}
            >
              {data.topLanguage}
            </div>
          </div>
        )}

        {/* Contribution heatmap */}
        {data.contributionCalendar && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid rgba(16, 185, 129, 0.1)",
              background: "rgba(6, 10, 16, 0.8)",
              overflow: "hidden",
            }}
          >
            <ContributionGrid calendar={data.contributionCalendar} />
          </div>
        )}
      </div>

      {/* Footer URL */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.4)",
            letterSpacing: "0.02em",
          }}
        >
          developerdanwu/git-wrapped-2025
        </div>
      </div>
    </div>
  );
}

interface UseSatoriImageResult {
  generateAndShare: () => Promise<void>;
  isGenerating: boolean;
  error: Error | null;
}

export function useSatoriImage(
  data: SummaryCardData,
  username: string
): UseSatoriImageResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isInitializing = useRef(false);

  // Pre-initialize WASM and fonts on mount
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    Promise.all([ensureWasmInitialized(), ensureFontsLoaded()]).catch((err) => {
      console.error("Failed to initialize Satori:", err);
    });
  }, []);

  const generateAndShare = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    const toastId = toast.loading("Generating image...");

    try {
      // Ensure WASM and fonts are loaded
      await Promise.all([ensureWasmInitialized(), ensureFontsLoaded()]);

      if (!fontData || !fontBoldData) {
        throw new Error("Fonts not loaded");
      }

      // Generate SVG with Satori
      const svg = await satori(<SummaryCardSatori data={data} />, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fonts: [
          { name: "Inter", data: fontData, weight: 400, style: "normal" },
          { name: "Inter", data: fontBoldData, weight: 700, style: "normal" },
        ],
      });

      // Convert SVG to PNG with Resvg (2x for retina)
      const resvg = new Resvg(svg, {
        fitTo: { mode: "width", value: CARD_WIDTH * 2 },
      });
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      // Create blob and file
      const blob = new Blob([new Uint8Array(pngBuffer)], { type: "image/png" });
      const filename = `git-wrapped-2025-${username}-summary.png`;
      const file = new File([blob], filename, { type: "image/png" });

      // Share or download
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Git Wrapped 2025",
          text: `My Git Wrapped 2025 - Summary`,
        });
        toast.success("Ready to save!", { id: toastId });
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Image downloaded!", { id: toastId });
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        toast.dismiss(toastId);
        return;
      }
      console.error("Failed to generate image:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to generate image")
      );
      toast.error("Failed to generate image", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }, [data, username]);

  return { generateAndShare, isGenerating, error };
}
