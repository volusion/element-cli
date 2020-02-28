module.exports = {
    moduleFileExtensions: ["ts", "js"],
    moduleDirectories: ["node_modules", "src"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testEnvironment: "node",
    rootDir: ".",
    testRegex: "src/.*\\.spec\\.(ts)$",
    verbose: true,
    coverageReporters: ["text"],
};