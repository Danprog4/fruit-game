import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "crypto", "util", "stream", "process"],
    }),
  ],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
});
