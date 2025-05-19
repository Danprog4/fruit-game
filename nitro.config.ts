import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  esbuild: {
    options: {
      target: "es2022", // Set to ES2022 to support top-level await
    },
  },
});
