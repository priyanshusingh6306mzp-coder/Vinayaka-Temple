import { defineConfig } from "vitest/config";
import path from "path";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
    // .env might not exist in some environments
  }
}

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 30000,
    server: {
      deps: {
        inline: ["next-auth"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
