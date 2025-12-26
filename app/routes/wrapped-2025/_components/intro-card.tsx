import { motion } from "motion/react";
import GithubOutline from "~/components/icons/github-outline";
import type { GitHubUser } from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

interface IntroCardProps {
  user: GitHubUser | undefined;
  direction: number;
}

// Pre-generated particle data to avoid re-randomizing on each render
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: (((i * 7) % 10) / 10) * 3 + 1,
  x: (i * 13) % 100,
  y: (i * 17) % 100,
  duration: (((i * 11) % 10) / 10) * 10 + 15,
  delay: (((i * 19) % 10) / 10) * 5,
}));

// Glowing GitHub Octocat with neon ring effect
function GlowingOctocat() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow - purple at top */}
      <div className="absolute -top-8 h-[160px] w-[240px] rounded-full bg-purple-500/20 blur-3xl" />

      {/* Outer ambient glow - cyan at bottom */}
      <div className="absolute -bottom-8 h-[160px] w-[240px] rounded-full bg-cyan-400/15 blur-3xl" />

      {/* Second glow layer - tighter */}
      <GithubOutline
        className="absolute h-[260px] w-[260px] opacity-60"
        style={{
          filter: `
            blur(3px)
            drop-shadow(0 0 6px rgba(168, 85, 247, 0.8))
            drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))
          `,
        }}
      />

      {/* Main crisp stroke on top */}
      <GithubOutline
        className="relative z-10 h-[260px] w-[260px]"
        style={{
          filter: `
            drop-shadow(0 0 2px rgba(192, 132, 252, 0.8))
            drop-shadow(0 0 3px rgba(168, 85, 247, 0.5))
          `,
        }}
      />
    </div>
  );
}

export function IntroCard({ user, direction }: IntroCardProps) {
  return (
    <WrappedCard
      direction={direction}
      customBackground
      noise="xl"
      className="
    rounded-[28px]
    bg-[rgb(2,6,23)]
    bg-[radial-gradient(circle_at_top_right,rgb(148,163,253,0.35),transparent_55%),radial-gradient(circle_at_bottom_left,rgb(56,189,248,0.25),transparent_55%)]
  "
    >
      {/* Content layout */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center py-16 text-center">
        {/* All content stacked together */}
        <div className="flex flex-col items-center">
          {/* Title */}
          <div className="flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="leading-none text-xl font-bold uppercase tracking-[0.3em] text-white/70"
            >
              Your Year in Code
            </motion.p>

            {/* 2025 and Octocat container */}
            <h1 className="relative z-10 text-[140px] font-bold leading-none bg-gradient-to-b from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              2025
            </h1>
          </div>

          {/* Glowing Octocat - positioned to overlap with 2025 */}
          <div className="relative flex flex-col items-center -mt-12 gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <GlowingOctocat />
            </motion.div>
            {/* User info - positioned right after the octocat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Avatar badge */}
              <div className="relative">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                    className="h-12 w-12 rounded-full border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30"
                  />
                ) : (
                  <div className="h-12 w-12 animate-pulse rounded-full bg-white/20" />
                )}
              </div>

              {/* User name */}
              <p className="text-xl font-semibold text-white md:text-2xl">
                {user?.name || user?.login || "Loading..."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </WrappedCard>
  );
}
