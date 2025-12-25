import { Code2, Folder, GitCommit, Github, Star } from "lucide-react";
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

// Native graph dimensions (53 weeks × 10px cells + 52 × 3px gaps)
const GRAPH_NATIVE_WIDTH = 53 * 10 + 52 * 3; // 686px
const GRAPH_NATIVE_HEIGHT = 7 * 10 + 6 * 3; // 88px

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
  "bg-white/10", // Level 0 - no contributions
  "bg-emerald-900/70", // Level 1
  "bg-emerald-700/80", // Level 2
  "bg-emerald-500/90", // Level 3
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
  const [graphScale, setGraphScale] = useState(0.7); // Default scale

  // Calculate scale factor based on container width
  useEffect(() => {
    const updateScale = () => {
      if (graphContainerRef.current) {
        const containerWidth = graphContainerRef.current.offsetWidth;
        // Leave some padding (24px total = 12px each side)
        const availableWidth = containerWidth - 24;
        const scale = Math.min(1, availableWidth / GRAPH_NATIVE_WIDTH);
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
    <WrappedCard
      direction={direction}
      gradient="from-slate-800 via-slate-900 to-black"
    >
      {/* GitHub logo watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
        <Github className="h-96 w-96" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 flex items-center gap-3"
      >
        <Github className="h-8 w-8" />
        <span className="text-xl font-bold">GitHub Wrapped</span>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.3 }}
        className="mb-4"
      >
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.name || user.login}
            className="h-16 w-16 rounded-full border-2 border-white/20"
          />
        )}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-1 text-xl font-bold"
      >
        {user?.name || user?.login}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-4 text-sm font-medium text-white/60"
      >
        2025 Year in Review
      </motion.p>

      {/* Contribution Graph */}
      {contributionCalendar && (
        <motion.div
          ref={graphContainerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="mb-4 w-full overflow-hidden rounded-xl bg-black/30 p-3 backdrop-blur-sm"
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
              <div className="flex gap-[3px]">
                {contributionCalendar.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.contributionDays.map((day) => {
                      const level = getContributionLevel(
                        day.contributionCount,
                        maxCount
                      );
                      return (
                        <div
                          key={day.date}
                          className={`h-[10px] w-[10px] rounded-sm ${LEVEL_COLORS[level]}`}
                          title={`${day.date}: ${day.contributionCount}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-sm text-white/60">
            <span className="font-semibold text-emerald-400">
              {activityStats.totalContributions.toLocaleString()}
            </span>{" "}
            contributions in the last year
          </p>
        </motion.div>
      )}

      {/* Stats grid - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-4 grid w-full max-w-sm grid-cols-4 gap-2"
      >
        <div className="rounded-lg bg-white/10 p-2 text-center backdrop-blur-sm">
          <Folder className="mx-auto mb-1 h-4 w-4 text-purple-400" />
          <p className="text-lg font-bold">{repoStats.totalRepos}</p>
          <p className="text-[10px] text-white/60">Repos</p>
        </div>

        <div className="rounded-lg bg-white/10 p-2 text-center backdrop-blur-sm">
          <Star className="mx-auto mb-1 h-4 w-4 text-yellow-400" />
          <p className="text-lg font-bold">{repoStats.totalStars}</p>
          <p className="text-[10px] text-white/60">Stars</p>
        </div>

        <div className="rounded-lg bg-white/10 p-2 text-center backdrop-blur-sm">
          <Code2 className="mx-auto mb-1 h-4 w-4 text-blue-400" />
          <p className="text-sm font-bold truncate">
            {topLanguage?.name || "N/A"}
          </p>
          <p className="text-[10px] text-white/60">Top Lang</p>
        </div>

        <div className="rounded-lg bg-white/10 p-2 text-center backdrop-blur-sm">
          <GitCommit className="mx-auto mb-1 h-4 w-4 text-green-400" />
          <p className="text-lg font-bold">{activityStats.totalCommits}</p>
          <p className="text-[10px] text-white/60">Commits</p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-white/40"
      >
        github.com/{user?.login}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-xs"
      >
        #GitHubWrapped2025
      </motion.div>
    </WrappedCard>
  );
}
