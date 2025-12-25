import { Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import type { RepoStats } from "./use-github-stats";
import { AnimatedNumber, WrappedCard } from "./wrapped-card";

interface StarsCardProps {
  repoStats: RepoStats;
  direction: number;
}

export function StarsCard({ repoStats, direction }: StarsCardProps) {
  return (
    <WrappedCard
      direction={direction}
      gradient="from-amber-500 via-yellow-500 to-orange-500"
    >
      {/* Floating stars decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.5, 1, 0.5],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="absolute"
            style={{
              left: `${10 + ((i * 7) % 80)}%`,
              top: `${15 + ((i * 11) % 70)}%`,
            }}
          >
            <Sparkles className="h-4 w-4 text-white/40" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
      >
        <Star className="h-12 w-12 fill-current" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-lg font-medium uppercase tracking-widest text-white/80"
      >
        Stars Received
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="mb-4"
      >
        <span className="font-serif text-8xl font-bold tracking-tight md:text-9xl">
          <AnimatedNumber value={repoStats.totalStars} />
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8 text-xl text-white/80"
      >
        across all your repositories
      </motion.p>

      {repoStats.totalStars > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-black/20 px-8 py-4 backdrop-blur-sm"
        >
          <p className="text-lg">
            {repoStats.totalStars >= 100
              ? "You're a star! ⭐"
              : repoStats.totalStars >= 10
              ? "Rising star! 🌟"
              : "Every star counts! ✨"}
          </p>
        </motion.div>
      )}
    </WrappedCard>
  );
}
