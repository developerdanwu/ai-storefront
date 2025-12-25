import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

const cardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

interface WrappedCardProps {
  children: ReactNode;
  direction: number;
  gradient?: string;
  className?: string;
  /** If true, skips the gradient and decorative elements - use for custom backgrounds */
  customBackground?: boolean;
}

export function WrappedCard({
  children,
  direction,
  gradient = "from-violet-600 via-purple-600 to-fuchsia-600",
  className,
  customBackground = false,
}: WrappedCardProps) {
  return (
    <motion.div
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12",
        !customBackground && "bg-gradient-to-br",
        !customBackground && gradient,
        "overflow-hidden",
        className
      )}
    >
      {/* Decorative background elements - only show if not custom background */}
      {!customBackground && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col items-center justify-center text-center text-white">
        {children}
      </div>
    </motion.div>
  );
}

// Animated number counter component
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1.5,
  className,
}: AnimatedNumberProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

// Staggered list animation wrapper
interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  delay?: number;
}

export function StaggeredList({
  children,
  className,
  delay = 0.1,
}: StaggeredListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Progress dots for navigation
interface ProgressDotsProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
}

export function ProgressDots({
  total,
  current,
  onDotClick,
}: ProgressDotsProps) {
  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDotClick?.(index);
          }}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === current
              ? "w-6 bg-white"
              : "w-2 bg-white/40 hover:bg-white/60"
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
