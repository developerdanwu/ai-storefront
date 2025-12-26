import { motion } from "motion/react";
import GithubOutline from "~/components/icons/github-outline";
import type { GitHubUser } from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

interface IntroCardProps {
  user: GitHubUser | undefined;
  direction: number;
}

// Color palette for particles
const PARTICLE_COLORS = [
  "bg-purple-400",
  "bg-purple-500",
  "bg-cyan-400",
  "bg-cyan-300",
  "bg-pink-400",
  "bg-blue-400",
  "bg-violet-400",
  "bg-teal-400",
];

// Pre-generated particle data to avoid re-randomizing on each render
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  size: (((i * 7) % 10) / 10) * 4 + 2,
  x: (i * 13) % 100,
  y: (i * 17) % 100,
  duration: (((i * 11) % 10) / 10) * 8 + 12,
  delay: (((i * 19) % 10) / 10) * 8,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  opacity: (((i * 23) % 10) / 10) * 0.5 + 0.3,
}));

function DiagonalBeam() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient for top-left beam - neon blue at edge, purple toward center */}
          <linearGradient id="beam-tl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity="1" />
            <stop
              offset="20%"
              stopColor="rgb(56, 189, 248)"
              stopOpacity="0.9"
            />
            <stop
              offset="50%"
              stopColor="rgb(139, 92, 246)"
              stopOpacity="0.7"
            />
            <stop
              offset="80%"
              stopColor="rgb(168, 85, 247)"
              stopOpacity="0.4"
            />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
          </linearGradient>
          {/* Gradient for bottom-right beam - purple from center, neon blue at edge */}
          <linearGradient id="beam-br" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
            <stop
              offset="20%"
              stopColor="rgb(168, 85, 247)"
              stopOpacity="0.4"
            />
            <stop
              offset="50%"
              stopColor="rgb(139, 92, 246)"
              stopOpacity="0.7"
            />
            <stop
              offset="80%"
              stopColor="rgb(56, 189, 248)"
              stopOpacity="0.9"
            />
            <stop offset="100%" stopColor="rgb(56, 189, 248)" stopOpacity="1" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top-left beam - from outside top-left to ~40% of the way */}
        <motion.line
          x1="-10"
          y1="-10"
          x2="45"
          y2="45"
          stroke="url(#beam-tl)"
          strokeWidth="0.4"
          filter="url(#beam-glow)"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        {/* Top-left beam glow */}
        <motion.line
          x1="-10"
          y1="-10"
          x2="45"
          y2="45"
          stroke="url(#beam-tl)"
          strokeWidth="1.5"
          opacity="0.3"
          filter="url(#beam-glow)"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Bottom-right beam - from ~60% to outside bottom-right */}
        <motion.line
          x1="65"
          y1="55"
          x2="110"
          y2="95"
          stroke="url(#beam-br)"
          strokeWidth="0.4"
          filter="url(#beam-glow)"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 3,
            delay: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        {/* Bottom-right beam glow */}
        <motion.line
          x1="65"
          y1="55"
          x2="110"
          y2="95"
          stroke="url(#beam-br)"
          strokeWidth="1.5"
          opacity="0.3"
          filter="url(#beam-glow)"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 3,
            delay: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${particle.color}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            filter: `blur(${particle.size > 4 ? 1 : 0}px)`,
            boxShadow: `0 0 ${particle.size * 2}px currentColor`,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [
              particle.opacity,
              particle.opacity * 1.5,
              particle.opacity * 0.7,
              particle.opacity * 1.2,
              particle.opacity,
            ],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Glowing GitHub Octocat with neon ring effect
function GlowingOctocat() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow - purple at top */}
      <div className="absolute -top-8 h-[160px] w-[240px] rounded-full bg-purple-500/20 blur-3xl" />

      {/* Outer ambient glow - cyan at bottom */}
      <div className="absolute -bottom-8 h-[160px] w-[240px] rounded-full bg-cyan-400/15 blur-3xl" />

      {/* Second glow layer - tighter */}
      {/* <GithubOutline
        className="absolute h-[260px] w-[260px] opacity-60"
        style={{
          filter: `
            blur(3px)
            drop-shadow(0 0 6px rgba(168, 85, 247, 0.8))
            drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))
          `,
        }}
      /> */}

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
      noise="xl"
      className="
    bg-[rgb(2,6,23)]
    bg-[radial-gradient(circle_at_top_right,rgb(148,163,253,0.35),transparent_55%),radial-gradient(circle_at_bottom_left,rgb(56,189,248,0.25),transparent_55%)]
  "
    >
      {/* Diagonal light beam */}
      <DiagonalBeam />

      {/* Floating particles background */}
      <FloatingParticles />

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
