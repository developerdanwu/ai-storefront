import { Code2 } from "lucide-react";
import { motion } from "motion/react";
import type { LanguageStats } from "./use-github-stats";
import { StaggeredList, WrappedCard } from "./wrapped-card";

interface LanguagesCardProps {
  languageStats: LanguageStats[];
  direction: number;
}

export function LanguagesCard({
  languageStats,
  direction,
}: LanguagesCardProps) {
  const topLanguage = languageStats[0];

  return (
    <WrappedCard
      direction={direction}
      gradient="from-orange-500 via-rose-500 to-pink-600"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
      >
        <Code2 className="h-10 w-10" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-lg font-medium uppercase tracking-widest text-white/80"
      >
        Your #1 Language
      </motion.p>

      {topLanguage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="mb-8"
        >
          <span
            className="font-serif text-5xl font-bold tracking-tight md:text-6xl"
            style={{ color: topLanguage.color }}
          >
            {topLanguage.name}
          </span>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-white/80"
      >
        used in {topLanguage?.percentage}% of your repositories
      </motion.p>

      <StaggeredList className="w-full max-w-xs space-y-3" delay={0.1}>
        {languageStats.map((lang, index) => (
          <div key={lang.name} className="flex items-center gap-3">
            <span className="w-6 text-right text-sm font-medium text-white/60">
              #{index + 1}
            </span>
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="flex-1 font-medium">{lang.name}</span>
            <span className="text-sm text-white/70">{lang.count} repos</span>
            <div className="w-16">
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lang.percentage}%` }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </StaggeredList>
    </WrappedCard>
  );
}
