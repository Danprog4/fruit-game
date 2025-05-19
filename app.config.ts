import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      NodeGlobalsPolyfillPlugin({
        buffer: true,
      }),
    ],
    esbuild: {
      target: "esnext", // Set higher target to support top-level await
    },
    build: {
      target: "esnext",
    },
  },

  // https://react.dev/learn/react-compiler
  react: {
    babel: {
      plugins: [
        [
          "babel-plugin-react-compiler",
          {
            target: "19",
          },
        ],
      ],
    },
  },

  tsr: {
    // https://github.com/TanStack/router/discussions/2863#discussioncomment-12458714
    appDirectory: "./src",
  },

  server: {
    // https://tanstack.com/start/latest/docs/framework/react/hosting#deployment
    preset: "vercel",
  },
});
