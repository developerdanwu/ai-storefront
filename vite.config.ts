import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    ...(mode === "development" ? [analyzer()] : []),
  ],
  build: {
    sourcemap: false,
    ...(mode === "development"
      ? {
          sourcemap: true,
        }
      : {}),
  },
}));
