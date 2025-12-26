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
  noise?: "xl" | "md" | "sm";
}

export function WrappedCard({
  children,
  direction,
  gradient = "from-violet-600 via-purple-600 to-fuchsia-600",
  className,
  noise,
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
        "h-full w-full relative inset-0 flex flex-col items-center justify-center p-8",
        "overflow-hidden",
        className
      )}
    >
      {children}
      <div
        className={cn("absolute w-full h-full", {
          "bg-noise-xl": noise === "xl",
          "bg-noise-md": noise === "md",
          "bg-noise-sm": noise === "sm",
        })}
      />
    </motion.div>
  );
}

// Animated number counter component
interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
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
