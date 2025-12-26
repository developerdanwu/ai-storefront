import { Sparkle } from "lucide-react";
import { motion } from "motion/react";
import type { RepoStats } from "./use-github-stats";
import { AnimatedNumber, WrappedCard } from "./wrapped-card";

interface StarsCardProps {
  repoStats: RepoStats;
  direction: number;
}

// 4-pointed star SVG component with gradient
function FourPointStar({
  className,
  gradient = false,
  style,
}: {
  className?: string;
  gradient?: boolean;
  style?: React.CSSProperties;
}) {
  const id = `star-gradient-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
        fill={gradient ? `url(#${id})` : "currentColor"}
      />
    </svg>
  );
}

export function StarsCard({ repoStats, direction }: StarsCardProps) {
  return (
    <WrappedCard
      direction={direction}
      customBackground
      noise="md"
      className="rounded-[28px]
    bg-[rgb(70,42,12)]
    bg-[radial-gradient(circle_at_top_right,rgb(255,235,160,1)_0%,rgb(220,190,110,0.8)_10%,rgb(180,140,60,0.5)_22%,rgb(130,90,35,0.25)_32%,transparent_45%),radial-gradient(circle_at_bottom_left,rgb(255,235,160,1)_0%,rgb(220,190,110,0.8)_10%,rgb(180,140,60,0.5)_22%,rgb(130,90,35,0.25)_32%,transparent_45%)]"
    >
      {/* Scattered sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + (i % 3),
              delay: 0.5 + i * 0.15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="absolute"
            style={{
              left: `${8 + ((i * 13) % 85)}%`,
              top: `${10 + ((i * 17) % 75)}%`,
            }}
          >
            <Sparkle
              className="h-3 w-3"
              style={{
                color:
                  i % 2 === 0
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,223,128,0.6)",
                filter: "drop-shadow(0 0 6px currentColor)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 text-xl font-bold uppercase tracking-[0.3em] text-white/90 md:text-2xl"
      >
        Stars Received
      </motion.p>

      {/* Giant fiery number with star */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        className="relative z-10 mb-4 flex items-center justify-center gap-2"
      >
        {/* Radial glow behind number */}
        <div
          className="absolute left-0 h-48 w-48 -translate-x-1/4"
          style={{
            background:
              "radial-gradient(circle, rgba(251,146,60,0.7) 0%, rgba(234,88,12,0.4) 30%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* Main number with gradient */}
        <span
          className="relative font-serif text-[10rem] font-black leading-none md:text-[12rem]"
          style={{
            background:
              "linear-gradient(180deg, #fde047 0%, #fbbf24 25%, #f97316 55%, #ea580c 75%, #c2410c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <AnimatedNumber value={repoStats.totalStars} />
        </span>

        {/* Stars cluster next to number - triangular configuration */}
        <div className="relative -mt-4 ml-2 h-24 w-24">
          {/* Glow behind stars cluster */}
          <div
            className="absolute -inset-4 blur-xl"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, rgba(251,191,36,0.5) 0%, transparent 60%)",
            }}
          />

          {/* Small star - top left */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            className="absolute left-0 top-0"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.3,
              }}
            >
              <FourPointStar
                gradient
                className="h-5 w-5 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] md:h-6 md:w-6"
              />
            </motion.div>
          </motion.div>

          {/* Large star - center */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="absolute left-3 top-2"
          >
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <FourPointStar
                gradient
                className="h-20 w-20"
                style={{
                  filter:
                    "drop-shadow(0 0 30px rgba(251,191,36,1)) drop-shadow(0 0 60px rgba(251,146,60,0.6))",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Medium star - bottom left */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="absolute -bottom-5 left-0"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <FourPointStar
                gradient
                className="h-8 w-8 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] md:h-10 md:w-10"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="relative z-10 mb-8 text-center text-lg text-white/70"
      >
        across all your
        <br />
        repositories
      </motion.p>

      {/* Frosted glass button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-8 py-3 backdrop-blur-md"
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <p className="relative text-base font-medium text-white/90">
          {repoStats.totalStars >= 100
            ? "You're a star! ⭐"
            : repoStats.totalStars >= 10
            ? "Rising star! 🌟"
            : "Every star counts!"}
        </p>
      </motion.div>
    </WrappedCard>
  );
}
