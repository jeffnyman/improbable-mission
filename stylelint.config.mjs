// @ts-check

/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["**/node_modules/**", "**/dist/**"],
  rules: {
    "color-no-invalid-hex": true,
    "no-unknown-animations": true,
    "no-unknown-custom-media": true,
    "no-unknown-custom-properties": true,
    "unit-no-unknown": true,
    "declaration-no-important": true,
    "max-nesting-depth": 4,
  },
};
