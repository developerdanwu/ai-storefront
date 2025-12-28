import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { z } from "zod";
import GithubOutline from "~/components/icons/github-outline";
import { Input } from "~/components/ui/input";
import { useAppForm } from "~/components/ui/tanstack-form";
import { cn } from "~/lib/utils";

const ZUsernameFormValues = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
      "Invalid GitHub username format"
    ),
});

type TUsernameFormValues = z.infer<typeof ZUsernameFormValues>;

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

// Planet components for corners
function Planets() {
  return (
    <>
      {/* Bottom-left pink/purple planet */}
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-600 via-purple-600 to-purple-800 opacity-80 blur-sm" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-purple-700 opacity-90" />
      </div>

      {/* Top-right cyan planet */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-cyan-400 via-teal-500 to-cyan-600 opacity-80 blur-sm" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-cyan-300 via-teal-400 to-cyan-500 opacity-90" />
      </div>
    </>
  );
}

// Glowing GitHub Octocat with neon ring effect
function GlowingOctocat() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow - purple at top */}
      <div className="absolute -top-12 h-[200px] w-[300px] rounded-full bg-purple-500/20 blur-3xl" />

      {/* Outer ambient glow - cyan at bottom */}
      <div className="absolute -bottom-12 h-[200px] w-[300px] rounded-full bg-cyan-400/15 blur-3xl" />

      {/* Main crisp stroke on top */}
      <GithubOutline
        className="relative z-10 h-[240px] xs:h-[280px] w-[240px] xs:w-[280px]"
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

// Grid overlay background
function GridOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Large grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px]" />
      {/* Medium grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Small grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
    </div>
  );
}

export function UsernameInput({
  onSubmit,
}: {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const form = useAppForm({
    validators: { onChange: ZUsernameFormValues },
    defaultValues: {
      username: "",
    },
    onSubmit: ({ value }) => {
      onSubmit(value.username.trim());
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <div
      className="relative flex w-full flex-col items-center justify-center min-h-dvh overflow-hidden py-16"
      style={{
        backgroundColor: "rgb(2,6,23)",
        backgroundImage: `
          radial-gradient(circle at top right, rgba(148,163,253,0.35), transparent 55%),
          radial-gradient(circle at bottom left, rgba(56,189,248,0.25), transparent 55%)
        `,
      }}
    >
      {/* Grid overlay */}
      <GridOverlay />

      {/* Diagonal light beams */}
      <DiagonalBeam />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Planets */}
      <Planets />

      {/* Noise texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-noise-xl opacity-30" />

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-6">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Glowing Octocat - positioned above 2025 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-[-60px] xs:mb-[-80px] z-0"
          >
            <GlowingOctocat />
          </motion.div>

          {/* 2025 large metallic text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative text-[130px] xs:text-[156px] font-bold leading-none bg-gradient-to-b from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
            style={{
              textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            }}
          >
            2025
          </motion.h1>

          {/* YOUR YEAR IN CODE subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className=" text-lg xs:text-xl font-bold uppercase tracking-[0.3em] text-white/70"
          >
            Your Year in Code
          </motion.p>

          {/* GitHub Wrapped title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
          >
            Git Wrapped
          </motion.h2>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="mt-14 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Card with glassmorphism border */}
          <div className="relative rounded-2xl p-[2px] bg-gradient-to-b from-cyan-500/50 via-teal-500/30 to-cyan-500/50">
            <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xl p-8">
              {/* Input form */}
              <form.AppForm>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <form.AppField
                    name="username"
                    children={(field) => (
                      <field.FormItem>
                        <field.FormControl>
                          <Input
                            size={24}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Enter your github username"
                          />
                        </field.FormControl>
                        <field.FormMessage className=" text-red-400" />
                      </field.FormItem>
                    )}
                  />

                  <form.Subscribe
                    selector={(state: {
                      canSubmit: boolean;
                      values: TUsernameFormValues;
                    }) => [state.canSubmit, state.values.username] as const}
                    children={([canSubmit, username]: readonly [
                      boolean,
                      string
                    ]) => (
                      <motion.button
                        type="submit"
                        disabled={!canSubmit}
                        className={cn(
                          "group relative flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition-all",
                          "bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 text-white hover:from-cyan-500 hover:via-teal-500 hover:to-cyan-500"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Generate github wrapped</span>
                      </motion.button>
                    )}
                  />
                </form>
              </form.AppForm>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
