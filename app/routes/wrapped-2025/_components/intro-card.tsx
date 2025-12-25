import { motion } from "motion/react";
import type { GitHubUser } from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

interface IntroCardProps {
  user: GitHubUser | undefined;
  direction: number;
}

export function IntroCard({ user, direction }: IntroCardProps) {
  return (
    <WrappedCard
      direction={direction}
      gradient="from-emerald-500 via-teal-600 to-cyan-700"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2,
        }}
        className="mb-8"
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || user.login}
            className="h-32 w-32 rounded-full border-4 border-white/30 shadow-2xl md:h-40 md:w-40"
          />
        ) : (
          <div className="h-32 w-32 animate-pulse rounded-full bg-white/20 md:h-40 md:w-40" />
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-2 text-lg font-medium uppercase tracking-widest text-white/80"
      >
        Your Year in Code
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-4 font-serif text-5xl font-bold tracking-tight md:text-7xl"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        2025
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-xl font-medium text-white/90 md:text-2xl"
      >
        {user?.name || user?.login || "Loading..."}
      </motion.p>

      {user?.bio && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 max-w-xs text-sm text-white/70"
        >
          {user.bio}
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-sm text-white/60"
      >
        Tap or press → to continue
      </motion.p>
    </WrappedCard>
  );
}
