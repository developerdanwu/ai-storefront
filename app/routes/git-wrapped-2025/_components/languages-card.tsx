import { motion } from "motion/react";
import type { TLanguageStats } from "../lib/github-languages.query";
import { WrappedCard } from "./wrapped-card";

interface LanguagesCardProps {
  languageStats: TLanguageStats[];
  direction: number;
}

// Language color mapping for visual variety
const languageColors: Record<string, { primary: string; glow: string }> = {
  TypeScript: { primary: "#3178c6", glow: "rgba(49, 120, 198, 0.6)" },
  JavaScript: { primary: "#f7df1e", glow: "rgba(247, 223, 30, 0.5)" },
  Python: { primary: "#3776ab", glow: "rgba(55, 118, 171, 0.6)" },
  Rust: { primary: "#dea584", glow: "rgba(222, 165, 132, 0.5)" },
  Go: { primary: "#00add8", glow: "rgba(0, 173, 216, 0.6)" },
  Ruby: { primary: "#cc342d", glow: "rgba(204, 52, 45, 0.5)" },
  Java: { primary: "#ed8b00", glow: "rgba(237, 139, 0, 0.5)" },
  Swift: { primary: "#fa7343", glow: "rgba(250, 115, 67, 0.5)" },
  Kotlin: { primary: "#7f52ff", glow: "rgba(127, 82, 255, 0.5)" },
  C: { primary: "#555555", glow: "rgba(85, 85, 85, 0.5)" },
  "C++": { primary: "#f34b7d", glow: "rgba(243, 75, 125, 0.5)" },
  "C#": { primary: "#178600", glow: "rgba(23, 134, 0, 0.5)" },
  PHP: { primary: "#777bb4", glow: "rgba(119, 123, 180, 0.5)" },
  Shell: { primary: "#89e051", glow: "rgba(137, 224, 81, 0.5)" },
  HTML: { primary: "#e34c26", glow: "rgba(227, 76, 38, 0.5)" },
  CSS: { primary: "#563d7c", glow: "rgba(86, 61, 124, 0.5)" },
  Vue: { primary: "#41b883", glow: "rgba(65, 184, 131, 0.5)" },
  Svelte: { primary: "#ff3e00", glow: "rgba(255, 62, 0, 0.5)" },
};

const defaultColor = { primary: "#10b981", glow: "rgba(16, 185, 129, 0.5)" };

// Animated code symbols floating in background
function FloatingCodeSymbols() {
  const symbols = [
    "{ }",
    "< />",
    "=>",
    "( )",
    "[ ]",
    "//",
    "&&",
    "||",
    "!=",
    "===",
    "++",
    "fn",
    "let",
    "const",
    "async",
  ];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    symbol: symbols[i % symbols.length],
    x: 5 + Math.random() * 90,
    y: Math.random() * 100,
    duration: 15 + Math.random() * 10,
    delay: Math.random() * 5,
    size: 10 + Math.random() * 8,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute font-mono text-white/[0.07] select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.03, 0.1, 0.03],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {particle.symbol}
        </motion.span>
      ))}
    </div>
  );
}

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
  const isTop = rank === 1;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3 + rank * 0.1,
      }}
      className={`
        relative flex h-7 w-7 items-center justify-center rounded-full
        font-bold text-xs
        ${
          isTop
            ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.5)]"
            : "bg-white/10 text-white/70 border border-white/10"
        }
      `}
    >
      {isTop && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          style={{ filter: "blur(8px)" }}
        />
      )}
      <span className="relative z-10">{rank}</span>
    </motion.div>
  );
}

// Individual language bar with rich animations
function LanguageBar({
  lang,
  index,
  maxPercentage,
  isTop,
}: {
  lang: TLanguageStats;
  index: number;
  maxPercentage: number;
  isTop: boolean;
}) {
  const colors = languageColors[lang.name] || defaultColor;
  const barWidth = (lang.percentage / maxPercentage) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.5 + index * 0.12,
        duration: 0.4,
        ease: "easeOut",
      }}
      className={`
        group relative flex items-center gap-3 rounded-xl p-3 px-4
        transition-colors duration-300
        ${isTop ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}
      `}
    >
      {/* Rank badge */}
      <RankBadge rank={index + 1} />

      {/* Language info and bar */}
      <div className="flex-1 min-w-0">
        {/* Name and percentage row */}
        <div className="flex items-center justify-between mb-1.5">
          <motion.span
            className={`font-semibold tracking-tight ${
              isTop ? "text-white text-base" : "text-white/80 text-sm"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.12 }}
          >
            {lang.name}
          </motion.span>

          <motion.span
            className={`font-mono text-xs tabular-nums ${
              isTop ? "text-white/90" : "text-white/50"
            }`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.12, type: "spring" }}
          >
            {lang.percentage.toFixed(1)}%
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.08]">
          {/* Animated fill */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${barWidth}%`, opacity: 1 }}
            transition={{
              delay: 0.7 + index * 0.12,
              duration: 0.8,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.primary}dd, ${colors.primary})`,
              boxShadow: `0 0 20px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                delay: 1.2 + index * 0.12,
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Glow pulse for top language */}
          {isTop && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.primary}40, transparent)`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function LanguagesCard({
  languageStats,
  direction,
}: LanguagesCardProps) {
  const topLanguage = languageStats[0];
  const maxPercentage = Math.max(...languageStats.map((l) => l.percentage));
  const topColor = languageColors[topLanguage?.name] || defaultColor;

  return (
    <WrappedCard
      direction={direction}
      noise="xl"
      className="rounded-[28px]
    bg-[rgb(2,6,23)]
    bg-[radial-gradient(circle_at_top_left,rgb(148,163,253,0.35),transparent_55%),radial-gradient(circle_at_center_right,rgb(56,189,248,0.25),transparent_55%)]"
    >
      {/* Dynamic gradient background based on top language */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, ${topColor.primary}25, transparent 70%),
            radial-gradient(ellipse 60% 40% at 100% 50%, ${topColor.primary}15, transparent 60%),
            radial-gradient(ellipse 50% 30% at 0% 80%, rgba(99, 102, 241, 0.1), transparent 50%)
          `,
        }}
      />

      {/* Floating code symbols */}
      <FloatingCodeSymbols />

      {/* Content layout - centered vertically */}
      <div className="relative z-10 flex h-full w-full flex-col justify-center py-8">
        {/* Header section */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-medium uppercase tracking-[0.3em] text-white/40"
          >
            Your #1 Language
          </motion.span>

          {topLanguage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 150,
                damping: 15,
              }}
              className="relative"
            >
              {/* Glow behind text */}
              <div
                className="absolute inset-0 blur-2xl opacity-60"
                style={{ background: topColor.primary }}
              />

              <span
                className="relative block text-6xl font-black tracking-tight"
                style={{
                  background: `linear-gradient(135deg, ${topColor.primary}, white, ${topColor.primary})`,
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: `drop-shadow(0 0 30px ${topColor.glow})`,
                }}
              >
                {topLanguage.name}
              </span>
            </motion.div>
          )}
        </div>

        {/* Language bars section - more spacing */}
        <div className="flex flex-col gap-3 px-2">
          {languageStats.slice(0, 5).map((lang, index) => (
            <LanguageBar
              key={lang.name}
              lang={lang}
              index={index}
              maxPercentage={maxPercentage}
              isTop={index === 0}
            />
          ))}
        </div>

        {/* Footer stat - positioned at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-0 right-0 text-center"
        >
          <span className="text-xs text-white/30">
            across {languageStats.length} languages
          </span>
        </motion.div>
      </div>
    </WrappedCard>
  );
}
