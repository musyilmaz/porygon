import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Porygon",
    description: "Capture interactive product demos",
    permissions: ["activeTab", "tabs", "scripting"],
  },
  webExt: {
    startUrls: ["https://example.com"],
  },
});
