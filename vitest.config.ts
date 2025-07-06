import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  // Load env files
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tsconfigPaths()],
    test: {
      environment: "edge-runtime",
      server: { deps: { inline: ["convex-test"] } },
      env,
      // Set default test timeout (30 seconds)
      testTimeout: 30000,
      // Configure reporters for artifact logging
      reporters: ["default", "verbose"],
      // Create test artifacts directory
      outputFile: {
        json: "./test-results/results.json",
      },
    },
    resolve: {
      alias: {
        // Help resolve OpenTelemetry modules
        "@opentelemetry/api": "@opentelemetry/api/build/esm/index.js",
      },
    },
  };
});
