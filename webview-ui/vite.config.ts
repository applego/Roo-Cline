import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	const isDevelopment = mode === "development"

	return {
		plugins: [react()],

		// 開発環境では '/'、本番環境では './' を使用
		base: isDevelopment ? "/" : "./",

		resolve: {
			alias: {
				"@": resolve(__dirname, "src"),
			},
		},

		server: {
			port: 5173,
			// 開発サーバーの設定
			hmr: {
				overlay: true,
			},
			// CORSの設定
			cors: true,
		},

		build: {
			// 本番ビルドの設定
			outDir: "dist",
			assetsDir: "assets",
			// チャンク分割を無効化（VS Code拡張用）
			rollupOptions: {
				output: {
					manualChunks: undefined,
				},
			},
			// ソースマップ
			sourcemap: isDevelopment,
			// 最小化
			minify: !isDevelopment,
		},

		// 環境変数のプリフィックス
		envPrefix: "VITE_",

		// CSS Modules
		css: {
			modules: {
				localsConvention: "camelCase",
			},
		},

		// 最適化設定
		optimizeDeps: {
			include: ["react", "react-dom", "@vscode/webview-ui-toolkit/react"],
		},

		// TypeScript設定
		esbuild: {
			// JSX構文の変換設定
			jsxInject: `import React from 'react'`,
		},
	}
})
