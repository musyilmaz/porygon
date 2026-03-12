import baseConfig from "@repo/eslint-config/base";

export default [
  ...baseConfig,
  {
    ignores: [".output/", ".wxt/"],
  },
];
