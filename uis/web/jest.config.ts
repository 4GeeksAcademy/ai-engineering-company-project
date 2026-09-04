import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  collectCoverageFrom: ["src/lib/apiClient.ts"],
};

export default createJestConfig(config);
