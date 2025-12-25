import { motion } from "motion/react";
import { GithubIcon } from "~/components/icons/github";
import type { LanguageStats } from "./use-github-stats";
import { WrappedCard } from "./wrapped-card";

interface LanguagesCardProps {
  languageStats: LanguageStats[];
  direction: number;
}

// Animated floating particles with warm tones
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 8 + 12,
    delay: Math.random() * 4,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-orange-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1],
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

// Glowing GitHub Octocat with fire/warm colors
function GlowingOctocat() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring with fire gradient */}
      <motion.div
        className="absolute h-28 w-28 rounded-full md:h-32 md:w-32"
        style={{
          background:
            "conic-gradient(from 0deg, #f97316, #eab308, #f59e0b, #ef4444, #f97316)",
          filter: "blur(2px)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Inner dark circle to create ring effect */}
      <div className="absolute h-24 w-24 rounded-full bg-[#0d1117] md:h-28 md:w-28" />

      {/* Glow effect behind icon */}
      <motion.div
        className="absolute h-20 w-20 rounded-full bg-orange-500/30 blur-xl md:h-24 md:w-24"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* GitHub Octocat icon with warm glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2,
        }}
        className="relative z-10"
      >
        <GithubIcon
          className="h-14 w-14 md:h-16 md:w-16"
          style={{
            color: "#fb923c",
            filter:
              "drop-shadow(0 0 15px rgba(251, 146, 60, 0.9)) drop-shadow(0 0 30px rgba(249, 115, 22, 0.6)) drop-shadow(0 0 45px rgba(234, 179, 8, 0.4))",
          }}
        />
      </motion.div>
    </div>
  );
}

// Fire text effect component
function FireText({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={className}
      style={{
        background:
          "linear-gradient(180deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter:
          "drop-shadow(0 0 8px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 16px rgba(249, 115, 22, 0.5))",
      }}
    >
      {children}
    </motion.span>
  );
}

export function LanguagesCard({
  languageStats,
  direction,
}: LanguagesCardProps) {
  const topLanguage = languageStats[0];
  const maxPercentage = Math.max(...languageStats.map((l) => l.percentage));

  return (
    <WrappedCard
      direction={direction}
      customBackground
      className="bg-[#0d1117]"
    >
      {/* Background atmosphere */}
      <FloatingParticles />

      {/* Radial gradient emanating from center-top */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-orange-900/20 via-transparent to-transparent" />
      </div>

      {/* Content layout */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between py-8 text-center md:py-12">
        {/* Top section - Glowing Octocat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <GlowingOctocat />
        </motion.div>

        {/* Middle section - Language title */}
        <div className="flex flex-col items-center gap-1 py-4">
          <FireText
            delay={0.3}
            className="text-sm font-bold uppercase tracking-[0.2em] md:text-base"
          >
            Your #1
          </FireText>

          {topLanguage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
            >
              <span
                className="block text-4xl font-black uppercase tracking-tight md:text-5xl"
                style={{
                  background:
                    "linear-gradient(180deg, #fef3c7 0%, #fbbf24 30%, #f97316 70%, #ea580c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter:
                    "drop-shadow(0 0 20px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 40px rgba(249, 115, 22, 0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                }}
              >
                {topLanguage.name}
              </span>
            </motion.div>
          )}

          <FireText
            delay={0.5}
            className="text-lg font-bold uppercase tracking-[0.15em] md:text-xl"
          >
            Language
          </FireText>
        </div>

        {/* Bottom section - Language progress bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs space-y-2.5"
        >
          {/* Header */}
          <div className="mb-3 text-left text-xs font-semibold uppercase tracking-wider text-white/50">
            Language
          </div>

          {languageStats.map((lang, index) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.08 }}
              className="flex items-center gap-3"
            >
              {/* Language name */}
              <span className="w-24 text-left text-sm font-medium text-white/90">
                {lang.name}
              </span>

              {/* Progress bar */}
              <div className="flex-1">
                <div className="h-3 overflow-hidden rounded-sm bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(lang.percentage / maxPercentage) * 100}%`,
                    }}
                    transition={{
                      delay: 0.9 + index * 0.1,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-sm"
                    style={{
                      background: `linear-gradient(90deg, #06b6d4 0%, #10b981 100%)`,
                      boxShadow: "0 0 10px rgba(6, 182, 212, 0.4)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </WrappedCard>
  );
}
