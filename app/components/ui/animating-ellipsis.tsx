import { motion } from "motion/react";

export function AnimatingEllipsis() {
  return (
    <span className="inline-flex ml-1">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{
            opacity: [0, 0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "linear",
            times: [0, index * 0.15, (index + 1) * 0.15, 0.8, 1],
          }}
          className="text-primary"
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
