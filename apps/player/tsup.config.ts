import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { "player.esm": "src/index.ts" },
    format: ["esm"],
    dts: { entry: { player: "src/index.ts" } },
    target: "es2020",
    platform: "browser",
    clean: true,
    external: ["@porygon/shared"],
  },
  {
    entry: { player: "src/embed.ts" },
    format: ["iife"],
    globalName: "Porygon",
    target: "es2020",
    platform: "browser",
    minify: true,
    sourcemap: true,
    noExternal: [/.*/],
  },
]);
