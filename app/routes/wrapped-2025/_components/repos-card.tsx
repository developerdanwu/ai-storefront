import { GitFork, Star } from "lucide-react";
import { motion } from "motion/react";
import type { RepoStats } from "./use-github-stats";
import { AnimatedNumber, WrappedCard } from "./wrapped-card";

interface ReposCardProps {
  repoStats: RepoStats;
  direction: number;
}

export function ReposCard({ repoStats, direction }: ReposCardProps) {
  return (
    <WrappedCard direction={direction} customBackground>
      {/* Dark background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated cyan/teal light streaks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary diagonal streak */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: [0.3, 0.6, 0.3], x: 0 }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute -right-20 top-0 h-full w-[300px] rotate-[25deg] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent blur-2xl"
        />

        {/* Secondary teal streak */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 4,
            delay: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute -right-10 top-1/4 h-[400px] w-[200px] rotate-[30deg] bg-gradient-to-b from-transparent via-teal-400/15 to-transparent blur-3xl"
        />

        {/* Accent green streak */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{
            duration: 5,
            delay: 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute right-10 top-1/3 h-[300px] w-[150px] rotate-[20deg] bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent blur-2xl"
        />

        {/* Subtle glow at top right */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-white">
        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/90"
        >
          Public
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/90"
        >
          Repositories
        </motion.p>

        {/* Large repo count */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mb-10"
        >
          <span className="font-serif text-8xl font-bold tracking-tight text-white md:text-9xl">
            <AnimatedNumber value={repoStats.totalRepos} />
          </span>
        </motion.div>

        {/* Stars and Forks stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 flex items-center gap-10"
        >
          {/* Stars */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-3xl font-bold text-white">
                {repoStats.totalStars}
              </span>
            </div>
            <span className="mt-1 text-xs uppercase tracking-wider text-slate-400">
              Stars
            </span>
          </div>

          {/* Forks */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-fuchsia-400" />
              <span className="text-3xl font-bold text-white">
                {repoStats.totalForks}
              </span>
            </div>
            <span className="mt-1 text-xs uppercase tracking-wider text-slate-400">
              Forks
            </span>
          </div>
        </motion.div>

        {/* Decorative stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8 flex items-end gap-3"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <Star className="h-5 w-5 fill-cyan-400/60 text-cyan-400/60" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 2.5,
              delay: 0.3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <Star className="h-7 w-7 fill-cyan-300/70 text-cyan-300/70" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 3,
              delay: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <Star className="h-9 w-9 fill-cyan-200/80 text-cyan-200/80" />
          </motion.div>
        </motion.div>

        {/* Most Starred button */}
        {repoStats.mostStarredRepo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-lg border border-cyan-500/30 bg-slate-900/80 px-6 py-3 backdrop-blur-sm">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10" />

              <div className="relative flex items-center gap-3">
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  Most Starred
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </motion.div>
              </div>
            </div>

            {/* Repo name tooltip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-2 text-center text-xs text-slate-400"
            >
              {repoStats.mostStarredRepo.name}
            </motion.p>
          </motion.div>
        )}
      </div>
    </WrappedCard>
  );
}
