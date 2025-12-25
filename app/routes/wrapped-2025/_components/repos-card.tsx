import { Folder, GitFork, Star } from "lucide-react";
import { motion } from "motion/react";
import type { RepoStats } from "./use-github-stats";
import { AnimatedNumber, WrappedCard } from "./wrapped-card";

interface ReposCardProps {
  repoStats: RepoStats;
  direction: number;
}

export function ReposCard({ repoStats, direction }: ReposCardProps) {
  return (
    <WrappedCard
      direction={direction}
      gradient="from-violet-600 via-purple-600 to-indigo-700"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
      >
        <Folder className="h-10 w-10" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-lg font-medium uppercase tracking-widest text-white/80"
      >
        Public Repositories
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="mb-8"
      >
        <span className="font-serif text-8xl font-bold tracking-tight md:text-9xl">
          <AnimatedNumber value={repoStats.totalRepos} />
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-8"
      >
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-300" />
          <span className="text-xl font-semibold">
            {repoStats.totalStars.toLocaleString()}
          </span>
          <span className="text-white/70">stars</span>
        </div>
        <div className="flex items-center gap-2">
          <GitFork className="h-5 w-5 text-blue-300" />
          <span className="text-xl font-semibold">
            {repoStats.totalForks.toLocaleString()}
          </span>
          <span className="text-white/70">forks</span>
        </div>
      </motion.div>

      {repoStats.mostStarredRepo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm"
        >
          <p className="mb-1 text-xs uppercase tracking-wider text-white/60">
            Most Starred
          </p>
          <p className="text-lg font-semibold">
            {repoStats.mostStarredRepo.name}
          </p>
          <p className="flex items-center gap-1 text-sm text-white/70">
            <Star className="h-3 w-3 text-yellow-300" />
            {repoStats.mostStarredRepo.stargazers_count} stars
          </p>
        </motion.div>
      )}
    </WrappedCard>
  );
}
