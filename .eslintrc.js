module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // TypeScript-specific rules
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",

    // General rules
    "no-console": "off", // We want console.log for this demo project
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],

    // Async/Promise rules
    "no-async-promise-executor": "error",
    "no-promise-executor-return": "error",
    "prefer-promise-reject-errors": "error",
    "require-atomic-updates": "error",

    // Best practices
    "no-duplicate-imports": "error",
    "no-useless-return": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
