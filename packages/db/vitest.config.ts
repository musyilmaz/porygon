import baseConfig from "@porygon/vitest-config/base";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      testTimeout: 30_000,
      sequence: {
        concurrent: false,
      },
      projects: [
        {
          test: {
            name: "db-unit",
            include: ["src/**/*.test.ts"],
          },
        },
        {
          test: {
            name: "db-integration",
            include: ["src/**/*.integration.test.ts"],
          },
        },
      ],
    },
  }),
);
