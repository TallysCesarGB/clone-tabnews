const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: ".",
});

const jestConfig = async () => {
  const config = await createJestConfig({
    moduleDirectories: ["node_modules", "<rootDir>/"],
    testTimeout: 60000,
  })();

  // next/jest sobrescreve transformIgnorePatterns, então modificamos depois
  config.transformIgnorePatterns = [
    "/node_modules/(?!(node-pg-migrate)/)",
  ];

  return config;
};

module.exports = jestConfig;