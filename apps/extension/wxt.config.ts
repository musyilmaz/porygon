import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Porygon",
    description: "Capture interactive product demos",
    permissions: ["activeTab", "tabs", "scripting", "storage", "cookies", "tabCapture", "offscreen", "webNavigation"],
    host_permissions: ["http://localhost:3000/*", "https://app.porygon.dev/*"],
  },
  dev: {
    server: {
      port: 3300,
    },
  },
  webExt: {
    startUrls: ["https://example.com"],
  },
});
