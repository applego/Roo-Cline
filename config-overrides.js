const path = require("path")
const { override, addWebpackAlias, addWebpackPlugin } = require("customize-cra")
const webpack = require("webpack")

module.exports = override(
	addWebpackAlias({
		"roo-shared": path.resolve(__dirname, "..", "src", "shared"),
		vscode: path.resolve(__dirname, "src", "types", "vscode.d.ts"),
	}),
	(config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: require.resolve("path-browserify"),
			stream: require.resolve("stream-browserify"),
			buffer: require.resolve("buffer/"),
			util: require.resolve("util/"),
		}

		config.plugins = [
			...config.plugins,
			new webpack.ProvidePlugin({
				Buffer: ["buffer", "Buffer"],
				process: "process/browser",
			}),
		]

		// Node.js専用モジュールの除外
		config.externals = {
			"pdf-parse": "pdf-parse",
			mammoth: "mammoth",
			isbinaryfile: "isbinaryfile",
		}

		return config
	},
)
