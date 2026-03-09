import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "routes/**/*.ts",
    "middleware/**/*.ts",
    "kafka/**/*.ts",
    "schemas.ts",
    "app.ts",
    "!routes/chat.ts", // SSE streaming — tested via integration tests
    "!routes/checkout.ts", // Legacy route — uses optional tables
    "!kafka/index.ts", // re-export barrel only
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageDirectory: "coverage",
  verbose: true,
};

export default config;
