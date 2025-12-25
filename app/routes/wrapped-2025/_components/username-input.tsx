import { ArrowRight, Github, Lock, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { z } from "zod";
import { useAppForm } from "~/components/ui/tanstack-form";
import { cn } from "~/lib/utils";

const UsernameSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
      "Invalid GitHub username format"
    ),
});

type UsernameFormValues = z.infer<typeof UsernameSchema>;

interface UsernameInputProps {
  onSubmit: (username: string) => void;
  onSignIn: () => void;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  authenticatedUsername?: string;
}

export function UsernameInput({
  onSubmit,
  onSignIn,
  isLoading,
  isAuthenticated,
  authenticatedUsername,
}: UsernameInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const form = useAppForm({
    validators: { onChange: UsernameSchema },
    defaultValues: {
      username: "",
    },
    onSubmit: ({ value }: { value: UsernameFormValues }) => {
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
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex w-full max-w-md flex-col items-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo and title */}
        <motion.div
          className="mb-8 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <Github className="h-10 w-10 text-white" />
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </div>
          <h1
            className="mb-2 text-center text-5xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            GitHub Wrapped
          </h1>
          <p className="text-center text-lg text-white/60">
            Your 2025 Year in Code
          </p>
        </motion.div>

        {/* Sign in with GitHub button - for full stats */}
        <motion.div
          className="mb-6 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {isAuthenticated && authenticatedUsername ? (
            <motion.button
              type="button"
              onClick={() => onSubmit(authenticatedUsername)}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292f] py-4 text-lg font-semibold text-white transition-all hover:bg-[#2d333b]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Github className="h-5 w-5" />
              <span>Continue as @{authenticatedUsername}</span>
              <span className="ml-1 flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                <Lock className="h-3 w-3" />
                Full Stats
              </span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={onSignIn}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292f] py-4 text-lg font-semibold text-white transition-all hover:bg-[#2d333b]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Github className="h-5 w-5" />
              <span>Sign in with GitHub</span>
              <span className="ml-1 flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                <Lock className="h-3 w-3" />
                Private repos
              </span>
            </motion.button>
          )}
          <p className="mt-2 text-center text-xs text-white/40">
            {isAuthenticated
              ? "View your complete stats including private repositories"
              : "Sign in to include private repos & detailed contribution data"}
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="mb-6 flex w-full items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-sm text-white/40">or enter any username</span>
          <div className="h-px flex-1 bg-white/20" />
        </motion.div>

        {/* Input form - for public stats */}
        <form.AppForm>
          <motion.form
            onSubmit={handleSubmit}
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <form.AppField
              name="username"
              children={(field: any) => (
                <field.FormItem className="mb-4">
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 blur transition-opacity duration-300",
                        isFocused && "opacity-75"
                      )}
                    />
                    <div className="relative flex items-center overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm">
                      <span className="pl-4 text-white/50">github.com/</span>
                      <field.FormControl>
                        <input
                          type="text"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={() => {
                            field.handleBlur();
                            setIsFocused(false);
                          }}
                          onFocus={() => setIsFocused(true)}
                          placeholder="username"
                          className="flex-1 bg-transparent px-1 py-4 text-lg text-white placeholder-white/30 outline-none"
                          autoComplete="off"
                          autoCapitalize="off"
                          spellCheck={false}
                        />
                      </field.FormControl>
                    </div>
                  </div>
                  <field.FormMessage className="mt-2 text-center text-red-400" />
                </field.FormItem>
              )}
            />

            <form.Subscribe
              selector={(state: {
                canSubmit: boolean;
                values: UsernameFormValues;
              }) => [state.canSubmit, state.values.username] as const}
              children={([canSubmit, username]: readonly [boolean, string]) => (
                <motion.button
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className={cn(
                    "group relative flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-semibold transition-all",
                    username
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white/70"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span>Loading stats...</span>
                    </>
                  ) : (
                    <>
                      <span>See Public Stats</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              )}
            />
          </motion.form>
        </form.AppForm>

        {/* Footer hint */}
        <motion.p
          className="mt-6 text-center text-sm text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Public stats only show public repositories and activity
        </motion.p>
      </motion.div>
    </div>
  );
}
