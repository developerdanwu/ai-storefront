import { Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ActivityStats,
  ContributionCalendar,
  GitHubUser,
  LanguageStats,
  RepoStats,
} from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

// Native graph dimensions (53 weeks × 8px cells + 52 × 2px gaps)
const GRAPH_NATIVE_WIDTH = 53 * 8 + 52 * 2; // 528px
const GRAPH_NATIVE_HEIGHT = 7 * 8 + 6 * 2; // 68px

interface SummaryCardProps {
  user: GitHubUser | undefined;
  repoStats: RepoStats;
  languageStats: LanguageStats[];
  activityStats: ActivityStats;
  contributionCalendar: ContributionCalendar | undefined;
  direction: number;
}

// Get contribution level for color intensity
function getContributionLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

// Contribution level colors (GitHub-style green)
const LEVEL_COLORS = [
  "bg-[#0a0f18]", // Level 0 - no contributions
  "bg-emerald-900/80", // Level 1
  "bg-emerald-600", // Level 2
  "bg-emerald-400", // Level 3
  "bg-emerald-300", // Level 4
];

export function SummaryCard({
  user,
  repoStats,
  languageStats,
  activityStats,
  contributionCalendar,
  direction,
}: SummaryCardProps) {
  const topLanguage = languageStats[0];
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphScale, setGraphScale] = useState(0.5);

  // Calculate scale factor based on container width
  useEffect(() => {
    const updateScale = () => {
      if (graphContainerRef.current) {
        const containerWidth = graphContainerRef.current.offsetWidth;
        const availableWidth = containerWidth - 16;
        const scale = Math.min(0.65, availableWidth / GRAPH_NATIVE_WIDTH);
        setGraphScale(scale);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Calculate max contribution count for color scaling
  const maxCount = useMemo(() => {
    if (!contributionCalendar) return 0;
    let max = 0;
    for (const week of contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        if (day.contributionCount > max) {
          max = day.contributionCount;
        }
      }
    }
    return max;
  }, [contributionCalendar]);

  return (
    <WrappedCard direction={direction} customBackground>
      {/* Custom dark background with neon glow effects */}
      <div className="absolute inset-0 overflow-hidden bg-[#030712]">
        {/* Main diagonal laser beams - top right */}
        <div className="absolute -right-10 -top-20 h-[400px] w-[3px] rotate-[35deg] bg-gradient-to-b from-transparent via-cyan-400/80 to-transparent blur-[2px]" />
        <div className="absolute -right-5 -top-16 h-[350px] w-[2px] rotate-[35deg] bg-gradient-to-b from-transparent via-emerald-400/60 to-transparent blur-[1px]" />
        <div className="absolute right-8 -top-10 h-[300px] w-[1px] rotate-[35deg] bg-gradient-to-b from-transparent via-teal-300/50 to-transparent" />

        {/* Secondary laser beams - bottom left */}
        <div className="absolute -bottom-20 -left-10 h-[400px] w-[3px] rotate-[35deg] bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent blur-[2px]" />
        <div className="absolute -bottom-16 left-4 h-[300px] w-[2px] rotate-[35deg] bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent blur-[1px]" />

        {/* Glow orbs */}
        <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-[80px]" />
        <div className="absolute -left-16 bottom-20 h-40 w-40 rounded-full bg-emerald-500/15 blur-[60px]" />
        <div className="absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-teal-400/10 blur-[50px]" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Animated floating particles */}
        <motion.div
          className="absolute right-12 top-20 h-1.5 w-1.5 rounded-full bg-cyan-400"
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-20 top-32 h-1 w-1 rounded-full bg-emerald-400"
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute left-16 bottom-32 h-1 w-1 rounded-full bg-teal-400"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute right-8 top-40 h-0.5 w-0.5 rounded-full bg-white"
          animate={{
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-6 text-white">
        {/* Main content box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#0a1018]/80 p-5 shadow-[0_0_40px_rgba(6,182,212,0.08)] backdrop-blur-sm"
        >
          {/* Inner glow effect at top */}
          <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

          {/* Profile Avatar with glowing gradient ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
            className="relative mx-auto mb-3 w-fit"
          >
            {/* Outer glow */}
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-cyan-500/40 blur-xl" />

            {/* Gradient border container */}
            <div className="relative rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-fuchsia-500 p-[3px]">
              {/* Inner dark background */}
              <div className="rounded-[10px] bg-[#0a0f18] p-1">
                {/* Avatar */}
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            {/* Badge overlay */}
            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/40">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
          </motion.div>

          {/* Username */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-4 text-center text-lg font-bold tracking-wide"
          >
            {user?.name || user?.login}
          </motion.h2>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-4 flex items-center justify-center gap-6"
          >
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {repoStats.totalRepos}
              </p>
              <p className="text-[9px] font-medium uppercase tracking-widest text-white/40">
                Repos
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {repoStats.totalStars}
              </p>
              <p className="text-[9px] font-medium uppercase tracking-widest text-white/40">
                Stars
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {activityStats.totalCommits}
              </p>
              <p className="text-[9px] font-medium uppercase tracking-widest text-white/40">
                Commits
              </p>
            </div>
          </motion.div>

          {/* Language Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="mb-4 text-center"
          >
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              {topLanguage?.name || "Code"}
            </span>
          </motion.div>

          {/* Contribution Heatmap */}
          {contributionCalendar && (
            <motion.div
              ref={graphContainerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="mb-4 w-full overflow-hidden rounded-lg border border-emerald-500/10 bg-[#060a10]/80 p-2"
            >
              {/* Graph wrapper - dynamically scales to fit container */}
              <div
                className="mx-auto"
                style={{
                  width: GRAPH_NATIVE_WIDTH * graphScale,
                  height: GRAPH_NATIVE_HEIGHT * graphScale,
                }}
              >
                <div
                  style={{
                    transform: `scale(${graphScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div className="flex gap-[2px]">
                    {contributionCalendar.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[2px]">
                        {week.contributionDays.map((day) => {
                          const level = getContributionLevel(
                            day.contributionCount,
                            maxCount
                          );
                          return (
                            <div
                              key={day.date}
                              className={`h-[8px] w-[8px] rounded-[2px] ${
                                LEVEL_COLORS[level]
                              } ${
                                level > 0
                                  ? "shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                                  : ""
                              }`}
                              title={`${day.date}: ${day.contributionCount}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Share Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-cyan-500/30 bg-gradient-to-r from-[#0d1f2d] to-[#0a1628] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]"
          >
            <span>Share Your Wrapped</span>
            <Sparkles className="h-3 w-3 text-cyan-400" />

            {/* Shine effect on hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </motion.button>
        </motion.div>
      </div>
    </WrappedCard>
  );
}
