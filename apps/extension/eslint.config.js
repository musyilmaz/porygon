import baseConfig from "@porygon/eslint-config/base";

export default [
  ...baseConfig,
  {
    ignores: [".output/", ".wxt/"],
  },
];
