import {
  CheckCircle2,
  CircleDot,
  GitCommitHorizontal,
  GitPullRequest,
} from "lucide-react";
import { motion } from "motion/react";
import type { ActivityStats } from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

interface ActivityCardProps {
  activityStats: ActivityStats;
  direction: number;
}

// Decorative cyan tech lines in the background
function TechLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Top-right curved lines */}
      <svg
        className="absolute -right-8 -top-8 h-48 w-48 opacity-30"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M 180 20 Q 160 80 100 100"
          stroke="url(#cyan-gradient-1)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 200 40 Q 170 100 90 130"
          stroke="url(#cyan-gradient-1)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M 200 10 Q 150 60 110 70"
          stroke="url(#cyan-gradient-1)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="cyan-gradient-1"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-left curved lines */}
      <svg
        className="absolute -bottom-8 -left-8 h-48 w-48 opacity-30"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M 20 180 Q 80 160 100 100"
          stroke="url(#cyan-gradient-2)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 0 160 Q 60 130 110 90"
          stroke="url(#cyan-gradient-2)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M 10 200 Q 60 150 70 110"
          stroke="url(#cyan-gradient-2)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="cyan-gradient-2"
            x1="100%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

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
    </div>
  );
}

// Stat card component for the 2x2 grid
interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  iconColor: string;
  iconBgColor: string;
  delay: number;
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconColor,
  iconBgColor,
  delay,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm md:px-5 md:py-4"
    >
      {/* Circular icon container */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-12 md:w-12 ${iconBgColor}`}
      >
        <Icon className={`h-5 w-5 md:h-6 md:w-6 ${iconColor}`} />
      </div>

      {/* Value and Label */}
      <div className="flex flex-col">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.15, type: "spring", stiffness: 200 }}
          className="text-2xl font-bold text-white md:text-3xl"
        >
          {value.toLocaleString()}
        </motion.span>
        <span className="text-xs font-medium text-white/60 md:text-sm">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

export function ActivityCard({ activityStats, direction }: ActivityCardProps) {
  const stats = [
    {
      icon: GitCommitHorizontal,
      label: "Commits",
      value: activityStats.totalCommits,
      iconColor: "text-green-400",
      iconBgColor: "bg-green-500/20",
    },
    {
      icon: GitPullRequest,
      label: "Pull Request",
      value: activityStats.totalPullRequests,
      iconColor: "text-purple-400",
      iconBgColor: "bg-purple-500/20",
    },
    {
      icon: CircleDot,
      label: "Issues",
      value: activityStats.totalIssues,
      iconColor: "text-emerald-400",
      iconBgColor: "bg-emerald-500/20",
    },
    {
      icon: CheckCircle2,
      label: "Code Review",
      value: activityStats.totalCodeReviews,
      iconColor: "text-yellow-400",
      iconBgColor: "bg-yellow-500/20",
    },
  ];

  return (
    <WrappedCard
      direction={direction}
      customBackground
      className="bg-[#0d1117]"
    >
      {/* Background decorations */}
      <TechLines />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6 text-center text-lg font-semibold uppercase tracking-[0.2em] text-white/80 md:mb-8 md:text-xl"
        >
          Your Contributions
        </motion.h2>

        {/* Stacked stats - 1 per row */}
        <div className="flex w-full max-w-xs flex-col gap-3 md:max-w-sm md:gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              iconColor={stat.iconColor}
              iconBgColor={stat.iconBgColor}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </WrappedCard>
  );
}
