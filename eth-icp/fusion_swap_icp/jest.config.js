module.exports = {
  testEnvironment: "node",
  verbose: true,
  clearMocks: true,
  testTimeout: 30000,        // 30 seconds for IC operations
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: [
    "<rootDir>/tests/**/*.test.ts"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  transform: {
    "^.+\\.(ts|js)$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!@dfinity/)"
  ],
  moduleNameMapper: {
    "\\.did$": "<rootDir>/tests/mocks/didMock.js"
  }
}; 