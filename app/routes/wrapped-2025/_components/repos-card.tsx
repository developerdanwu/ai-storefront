import { Star, Wrench } from "lucide-react";
import { motion } from "motion/react";
import type { RepoStats } from "./use-github-stats";
import { AnimatedNumber, WrappedCard } from "./wrapped-card";

interface ReposCardProps {
  repoStats: RepoStats;
  direction: number;
}

// 4-pointed star SVG for decorative elements
function FourPointStar({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      <path
        d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ReposCard({ repoStats, direction }: ReposCardProps) {
  return (
    <WrappedCard noise="xl" direction={direction}>
      {/* Deep dark background with cyan/purple radial gradients */}
      <div className="absolute inset-0 bg-[#030712]" />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated light beams */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary cyan beam from bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute bottom-0 left-1/2 h-[70%] w-[2px] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to top, rgba(6, 182, 212, 0.8), rgba(56, 189, 248, 0.4), transparent)",
            boxShadow: "0 0 40px 8px rgba(6, 182, 212, 0.3)",
          }}
        />

        {/* Left diagonal beam */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 4,
            delay: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute -left-10 bottom-0 h-[400px] w-[3px] origin-bottom rotate-[25deg]"
          style={{
            background:
              "linear-gradient(to top, rgba(139, 92, 246, 0.6), transparent)",
            boxShadow: "0 0 30px 5px rgba(139, 92, 246, 0.2)",
          }}
        />

        {/* Right diagonal beam */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 4,
            delay: 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute -right-10 bottom-0 h-[400px] w-[3px] origin-bottom -rotate-[25deg]"
          style={{
            background:
              "linear-gradient(to top, rgba(139, 92, 246, 0.6), transparent)",
            boxShadow: "0 0 30px 5px rgba(139, 92, 246, 0.2)",
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [-20, -200],
            }}
            transition={{
              duration: 4 + i,
              delay: i * 0.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
            className="absolute h-1 w-1 rounded-full bg-cyan-400"
            style={{
              left: `${20 + i * 12}%`,
              bottom: "20%",
              boxShadow: "0 0 10px 2px rgba(34, 211, 238, 0.6)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-white">
        {/* Title with glow */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-center"
        >
          <p
            className="text-base font-bold uppercase tracking-[0.35em] md:text-lg"
            style={{
              background:
                "linear-gradient(180deg, #67e8f9 0%, #22d3ee 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 40px rgba(34, 211, 238, 0.5)",
            }}
          >
            Public
          </p>
          <p
            className="text-base font-bold uppercase tracking-[0.35em] md:text-lg"
            style={{
              background:
                "linear-gradient(180deg, #67e8f9 0%, #22d3ee 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 40px rgba(34, 211, 238, 0.5)",
            }}
          >
            Repositories
          </p>
        </motion.div>

        {/* Giant glowing number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className="relative mb-6"
        >
          {/* Glow behind number */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)",
              filter: "blur(40px)",
              transform: "scale(1.5)",
            }}
          />
          <span
            className="font-serif text-[8rem] font-black leading-none md:text-[10rem]"
            style={{
              background:
                "linear-gradient(180deg, #ffffff 0%, #67e8f9 30%, #22d3ee 60%, #0891b2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(34, 211, 238, 0.6))",
            }}
          >
            <AnimatedNumber value={repoStats.totalRepos} />
          </span>
        </motion.div>

        {/* Decorative star cluster with neon glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative mb-6 flex items-end justify-center gap-2"
        >
          {/* Small star left */}
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <FourPointStar
              className="h-4 w-4 text-violet-400/70 md:h-5 md:w-5"
              style={{
                filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))",
              }}
            />
          </motion.div>

          {/* Medium star */}
          <motion.div
            animate={{ y: [0, -8, 0], scale: [1, 1.1, 1] }}
            transition={{
              duration: 3,
              delay: 0.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <FourPointStar
              className="h-7 w-7 text-cyan-300 md:h-8 md:w-8"
              style={{
                filter:
                  "drop-shadow(0 0 15px rgba(34, 211, 238, 0.9)) drop-shadow(0 0 30px rgba(34, 211, 238, 0.5))",
              }}
            />
          </motion.div>

          {/* Large center star */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3.5,
              delay: 0.4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <FourPointStar
              className="h-10 w-10 text-cyan-200 md:h-12 md:w-12"
              style={{
                filter:
                  "drop-shadow(0 0 20px rgba(165, 243, 252, 1)) drop-shadow(0 0 40px rgba(34, 211, 238, 0.7))",
              }}
            />
          </motion.div>

          {/* Wrench icon */}
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [0, -15, 0] }}
            transition={{
              duration: 2.8,
              delay: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="ml-1"
          >
            <Wrench
              className="h-6 w-6 text-violet-400 md:h-7 md:w-7"
              style={{
                filter:
                  "drop-shadow(0 0 12px rgba(139, 92, 246, 0.9)) drop-shadow(0 0 25px rgba(139, 92, 246, 0.5))",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Most Starred button with dramatic glow */}
        {repoStats.mostStarredRepo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative"
          >
            {/* Outer glow */}
            <div
              className="absolute -inset-2 rounded-xl opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))",
                filter: "blur(15px)",
              }}
            />

            <div className="relative overflow-hidden rounded-lg border border-cyan-500/40 bg-slate-900/90 px-6 py-3 backdrop-blur-sm">
              {/* Animated shine effect */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2,
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              />

              {/* Inner gradient border effect */}
              <div className="absolute inset-[1px] rounded-[7px] bg-gradient-to-br from-slate-800/50 to-slate-900/80" />

              <div className="relative flex items-center gap-3">
                <span className="text-sm font-bold uppercase tracking-widest text-white">
                  Most Starred
                </span>
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 15, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Star
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    style={{
                      filter:
                        "drop-shadow(0 0 8px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 15px rgba(251, 191, 36, 0.5))",
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Repo name with subtle animation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-3 text-center text-sm font-medium text-cyan-300/80"
              style={{
                textShadow: "0 0 20px rgba(34, 211, 238, 0.3)",
              }}
            >
              {repoStats.mostStarredRepo.name}
            </motion.p>
          </motion.div>
        )}
      </div>
    </WrappedCard>
  );
}
