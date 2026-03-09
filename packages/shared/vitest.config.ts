import baseConfig from "@repo/vitest-config/base";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, defineConfig({
  test: {
    coverage: {
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/types/**",
        "src/**/index.ts",
      ],
    },
  },
}));
