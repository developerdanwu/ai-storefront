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
  "bg-[#0d1117]", // Level 0 - no contributions
  "bg-emerald-900/80", // Level 1
  "bg-emerald-700", // Level 2
  "bg-emerald-500", // Level 3
  "bg-emerald-400", // Level 4
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
      {/* Custom dark background with glow effects */}
      <div className="absolute inset-0 bg-[#070b14]">
        {/* Cyan/teal glow streaks in top-right */}
        <div className="absolute -right-20 -top-10 h-64 w-64 bg-gradient-to-bl from-cyan-500/30 via-teal-500/20 to-transparent blur-3xl" />
        <div className="absolute right-10 top-20 h-32 w-48 rotate-45 bg-gradient-to-l from-cyan-400/20 via-emerald-500/15 to-transparent blur-2xl" />
        <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-bl from-teal-400/25 to-transparent blur-2xl" />

        {/* Subtle bottom glow */}
        <div className="absolute -bottom-10 left-1/2 h-32 w-64 -translate-x-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent blur-3xl" />

        {/* Wave pattern at bottom */}
        <svg
          className="absolute bottom-0 left-0 right-0 h-24 opacity-20"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q50,30 100,50 T200,50 T300,50 T400,50 L400,100 L0,100 Z"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating particles */}
        <div className="absolute right-16 top-16 h-1 w-1 animate-pulse rounded-full bg-cyan-400/60" />
        <div className="absolute right-24 top-28 h-0.5 w-0.5 animate-pulse rounded-full bg-emerald-400/50" />
        <div className="absolute right-8 top-36 h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400/40" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-6 text-white">
        {/* Profile Avatar with gradient ring and badge */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
          className="relative mb-3"
        >
          {/* Gradient ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 p-[3px]">
            <div className="h-full w-full rounded-full bg-[#070b14]" />
          </div>

          {/* Avatar */}
          {user?.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="relative h-16 w-16 rounded-full object-cover"
            />
          )}

          {/* Badge overlay */}
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
        </motion.div>

        {/* Username */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4 text-lg font-bold tracking-wide"
        >
          {user?.name || user?.login}
        </motion.h2>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-3 flex items-center gap-6"
        >
          <div className="text-center">
            <p className="text-xl font-bold text-white">{repoStats.totalRepos}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Repos</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{repoStats.totalStars}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Stars</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{activityStats.totalCommits}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Commits</p>
          </div>
        </motion.div>

        {/* Language Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="mb-4"
        >
          <span className="rounded bg-gradient-to-r from-cyan-500/20 to-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400 ring-1 ring-cyan-500/30">
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
            className="mb-4 w-full overflow-hidden rounded-lg bg-[#0d1117]/80 p-2 backdrop-blur-sm"
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
                            className={`h-[8px] w-[8px] rounded-[2px] ${LEVEL_COLORS[level]}`}
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
          className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-pink-600 to-pink-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-pink-500/40"
        >
          <span>Share Your Wrapped</span>
          <Sparkles className="h-3.5 w-3.5 text-pink-200" />

          {/* Shine effect on hover */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </motion.button>

        {/* Small star decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: "spring" }}
          className="absolute bottom-8 right-8"
        >
          <Sparkles className="h-4 w-4 text-pink-400/60" />
        </motion.div>
      </div>
    </WrappedCard>
  );
}
