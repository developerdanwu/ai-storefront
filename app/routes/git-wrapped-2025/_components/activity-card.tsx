import { Calendar, Flame, Percent, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { formatNumber } from "~/lib/utils";
import type { ActivityStats } from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

interface ActivityCardProps {
  activityStats: ActivityStats;
  direction: number;
}

// Stat card component with glowing effects
interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  color: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  delay: number;
}

function StatCard({
  icon: Icon,
  value,
  label,
  suffix,
  color,
  glowColor,
  gradientFrom,
  gradientTo,
  delay,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="group relative"
    >
      {/* Outer glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl blur-xl"
        style={{ background: glowColor }}
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          delay,
        }}
      />

      {/* Gradient border */}
      <div
        className="absolute -inset-[1px] rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}50, transparent 50%, ${gradientTo}50)`,
          opacity: 0.6,
        }}
      />

      {/* Card content */}
      <div className="relative flex items-center gap-5 rounded-2xl bg-[rgb(15,23,42)]/90 px-6 py-5 backdrop-blur-sm">
        {/* Glowing icon - no container */}
        <div className="relative shrink-0 flex h-12 w-12 items-center justify-center">
          {/* Subtle glow behind icon */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40"
            style={{ background: glowColor }}
          />

          {/* The icon itself with subtle glow */}
          <Icon
            className="relative h-8 w-8"
            strokeWidth={1.75}
            style={{
              color,
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </div>

        {/* Value and Label */}
        <div className="flex flex-col gap-0.5">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.15, type: "spring", stiffness: 200 }}
            className="text-4xl font-bold tabular-nums tracking-tight text-white"
            style={{
              textShadow: `0 0 40px ${glowColor}`,
            }}
          >
            {formatNumber(value)}
            {suffix && (
              <span className="ml-1 text-lg font-medium text-white/60">
                {suffix}
              </span>
            )}
          </motion.span>
          <span className="text-sm font-medium text-white/40">{label}</span>
        </div>

        {/* Accent line on the right */}
        <div
          className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full"
          style={{
            background: `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: `0 0 15px ${glowColor}`,
          }}
        />
      </div>
    </motion.div>
  );
}

export function ActivityCard({ activityStats, direction }: ActivityCardProps) {
  const totalContributions = activityStats.totalContributions;

  const stats = [
    {
      icon: Flame,
      label: "Longest Streak",
      value: activityStats.longestStreak,
      suffix: "days",
      color: "#f97316",
      glowColor: "rgba(249, 115, 22, 0.5)",
      gradientFrom: "#f97316",
      gradientTo: "#ea580c",
    },
    {
      icon: Trophy,
      label: `Best Month (${activityStats.bestMonth.month})`,
      value: activityStats.bestMonth.count,
      color: "#fbbf24",
      glowColor: "rgba(251, 191, 36, 0.5)",
      gradientFrom: "#f59e0b",
      gradientTo: "#d97706",
    },
    {
      icon: Calendar,
      label: "Weekend Warrior",
      value: activityStats.weekendContributions,
      color: "#4ade80",
      glowColor: "rgba(74, 222, 128, 0.5)",
      gradientFrom: "#22c55e",
      gradientTo: "#16a34a",
    },
    {
      icon: Percent,
      label: `Active Days (${activityStats.activeDays}/${activityStats.totalDays})`,
      value: activityStats.activeDaysPercentage,
      suffix: "%",
      color: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.5)",
      gradientFrom: "#0ea5e9",
      gradientTo: "#0284c7",
    },
  ];

  return (
    <WrappedCard
      direction={direction}
      noise="xl"
      className="bg-[rgb(2,6,23)] bg-[radial-gradient(circle_at_top_right,rgb(148,163,253,0.25),transparent_55%),radial-gradient(circle_at_bottom_left,rgb(56,189,248,0.2),transparent_55%)]"
    >
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-center px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
            2025 Stats
          </span>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-white">
            Your Contributions
          </h2>
        </motion.div>

        {/* Stacked stats - full width */}
        <div className="flex w-full flex-col gap-3">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              color={stat.color}
              glowColor={stat.glowColor}
              gradientFrom={stat.gradientFrom}
              gradientTo={stat.gradientTo}
              delay={0.2 + index * 0.12}
            />
          ))}
        </div>

        {/* Total contributions footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-baseline gap-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
              className="text-3xl font-bold tabular-nums text-white"
              style={{
                textShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
              }}
            >
              {formatNumber(totalContributions)}
            </motion.span>
            <span className="text-sm font-medium text-white/40">
              total contributions
            </span>
          </div>
        </motion.div>
      </div>
    </WrappedCard>
  );
}
