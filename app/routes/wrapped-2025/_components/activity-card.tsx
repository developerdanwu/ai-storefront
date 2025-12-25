import {
  Activity,
  CircleDot,
  Eye,
  GitCommit,
  GitPullRequest,
} from "lucide-react";
import { motion } from "motion/react";
import type { ActivityStats } from "./use-github-stats";
import { StaggeredList, WrappedCard } from "./wrapped-card";

interface ActivityCardProps {
  activityStats: ActivityStats;
  direction: number;
}

export function ActivityCard({ activityStats, direction }: ActivityCardProps) {
  const activities = [
    {
      icon: GitCommit,
      label: "Commits",
      value: activityStats.totalCommits,
      color: "text-green-300",
      bgColor: "bg-green-500/20",
    },
    {
      icon: GitPullRequest,
      label: "Pull Requests",
      value: activityStats.totalPullRequests,
      color: "text-purple-300",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: CircleDot,
      label: "Issues",
      value: activityStats.totalIssues,
      color: "text-blue-300",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: Eye,
      label: "Code Reviews",
      value: activityStats.totalCodeReviews,
      color: "text-yellow-300",
      bgColor: "bg-yellow-500/20",
    },
  ];

  return (
    <WrappedCard
      direction={direction}
      gradient="from-blue-600 via-indigo-600 to-violet-700"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
      >
        <Activity className="h-10 w-10" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-lg font-medium uppercase tracking-widest text-white/80"
      >
        Your Contributions
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8 text-sm text-white/60"
      >
        Past year of activity
      </motion.p>

      <StaggeredList className="w-full max-w-sm space-y-3" delay={0.12}>
        {activities.map((activity) => (
          <div
            key={activity.label}
            className="flex items-center gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${activity.bgColor}`}
            >
              <activity.icon className={`h-6 w-6 ${activity.color}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-white/70">{activity.label}</p>
              <p className="text-2xl font-bold">
                {activity.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </StaggeredList>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-white/60">Total contributions</p>
        <p className="text-4xl font-bold">
          {activityStats.totalContributions.toLocaleString()}
        </p>
        {activityStats.contributedRepos > 0 && (
          <p className="mt-1 text-sm text-white/50">
            across {activityStats.contributedRepos} repositories
          </p>
        )}
      </motion.div>
    </WrappedCard>
  );
}
