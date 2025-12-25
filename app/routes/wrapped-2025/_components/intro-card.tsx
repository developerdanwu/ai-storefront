import { motion } from "motion/react";
import { GithubIcon } from "~/components/icons/github";
import type { GitHubUser } from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

interface IntroCardProps {
  user: GitHubUser | undefined;
  direction: number;
}

// Animated floating particles for atmosphere
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
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
      {/* Outer glow ring */}
      <motion.div
        className="absolute h-52 w-52 rounded-full md:h-64 md:w-64"
        style={{
          background:
            "conic-gradient(from 0deg, #06b6d4, #0ea5e9, #8b5cf6, #d946ef, #06b6d4)",
          filter: "blur(2px)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Inner dark circle to create ring effect */}
      <div className="absolute h-44 w-44 rounded-full bg-[#0d1117] md:h-56 md:w-56" />

      {/* Glow effect behind icon */}
      <motion.div
        className="absolute h-36 w-36 rounded-full bg-cyan-500/20 blur-2xl md:h-44 md:w-44"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* GitHub Octocat icon with neon glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.3,
        }}
        className="relative z-10"
      >
        <GithubIcon
          className="h-28 w-28 md:h-36 md:w-36"
          style={{
            color: "#22d3ee",
            filter:
              "drop-shadow(0 0 20px rgba(34, 211, 238, 0.8)) drop-shadow(0 0 40px rgba(34, 211, 238, 0.5)) drop-shadow(0 0 60px rgba(34, 211, 238, 0.3))",
          }}
        />
      </motion.div>
    </div>
  );
}

export function IntroCard({ user, direction }: IntroCardProps) {
  return (
    <WrappedCard
      direction={direction}
      customBackground
      className="bg-[#0d1117]"
    >
      {/* Background atmosphere */}
      <FloatingParticles />

      {/* Radial gradient emanating from center */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-cyan-900/20 via-transparent to-transparent" />
      </div>

      {/* Content layout */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between py-16 text-center">
        {/* Top section - Title */}
        <div className="flex flex-col items-center gap-2">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-bold uppercase tracking-[0.3em] text-white/90 md:text-base"
          >
            Your Year in Code
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-7xl font-black tracking-tight text-white md:text-8xl"
            style={{
              textShadow: "0 0 40px rgba(255,255,255,0.3)",
            }}
          >
            2025
          </motion.h1>
        </div>

        {/* Center - Glowing Octocat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex-1 flex items-center justify-center"
        >
          <GlowingOctocat />
        </motion.div>

        {/* Bottom section - User info */}
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
    </WrappedCard>
  );
}
