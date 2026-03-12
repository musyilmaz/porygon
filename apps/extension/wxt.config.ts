import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Porygon",
    description: "Capture interactive product demos",
    permissions: ["activeTab", "tabs", "scripting", "storage", "cookies"],
    host_permissions: ["http://localhost:3000/*", "https://app.porygon.dev/*"],
  },
  webExt: {
    startUrls: ["https://example.com"],
  },
});
