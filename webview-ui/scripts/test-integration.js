const { resolve } = require("path")
const { config } = require("dotenv")
const concurrently = require("concurrently")

// .env.testファイルを読み込む
config({ path: resolve(__dirname, "..", ".env.test") })

const commands = [
	{
		command: "cd ../server && PORT=3002 pnpm dev",
		name: "server",
		prefixColor: "blue",
	},
	{
		// wait-onを使用してサーバーの起動を待機
		command:
			"wait-on tcp:3002 && cross-env NODE_ENV=test pnpm test ./src/services/api/__tests__/integration.test.ts",
		name: "test",
		prefixColor: "green",
	},
]

const options = {
	prefix: "name",
	killOthers: ["failure", "success"],
	restartTries: 3,
	restartDelay: 1000,
}

try {
	const { result } = concurrently(commands, options)

	result.then(
		() => {
			console.log("All processes completed successfully")
			process.exit(0)
		},
		(error) => {
			console.error("One or more processes failed:", error)
			process.exit(1)
		},
	)
} catch (error) {
	console.error("Failed to start processes:", error)
	process.exit(1)
}

// SIGINT（Ctrl+C）を処理
process.on("SIGINT", () => {
	console.log("\nGracefully shutting down...")
	process.exit(0)
})
