/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	roots: ["<rootDir>/src"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^@vscode/webview-ui-toolkit/react$": "<rootDir>/src/__mocks__/@vscode/webview-ui-toolkit/react.tsx",
	},
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
	testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
	transformIgnorePatterns: ["node_modules/(?!(@vscode/webview-ui-toolkit|@microsoft/fast-react-wrapper)/)"],
}
