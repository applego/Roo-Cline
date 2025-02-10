import path from "path"
import { fileURLToPath } from "url"
import express from "express"
import cors from "cors"
import { WebSocketServerImpl } from "./src/websocket/websocket-server.js"
import { WebSocketMessage, WebSocketConnection } from "./src/types.js"
import { ConfigStore } from "./src/config/ConfigStore.js"
import { McpManager } from "./src/mcp/McpManager.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT ? parseInt(process.env.PORT) : 3002 // Changed to 3002
const wsPort = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001
const CONFIG_DIR = process.env.CONFIG_DIR || path.join(__dirname, "config")

app.use(cors())
app.use(express.json())

// 静的ファイルの提供（webview-uiのビルド成果物）
app.use(express.static(path.join(__dirname, "../../webview-ui/build")))

// Initialize services
const configStore = new ConfigStore(CONFIG_DIR)
console.log("ConfigStore initialized with config directory:", CONFIG_DIR)

const mcpManager = new McpManager()
console.log("McpManager initialized")

// Initialize WebSocket server
const wss = new WebSocketServerImpl(wsPort, configStore, mcpManager)
console.log(`WebSocket server started on port ${wsPort}`)

// クライアントからのメッセージを処理
wss.onMessage(async (message: WebSocketMessage, connection: WebSocketConnection) => {
	try {
		switch (message.type) {
			case "getConfig":
				const config = await configStore.load()
				connection.send({
					type: "config",
					payload: config,
				})
				break

			case "saveConfig":
				await configStore.save(message.payload)
				connection.send({
					type: "configSaved",
					payload: { success: true },
				})
				break

			case "mcpRequest":
				if (!message.payload?.serverName || !message.payload?.toolName) {
					throw new Error("Invalid MCP request")
				}
				const result = await mcpManager.callTool(
					message.payload.serverName,
					message.payload.toolName,
					message.payload.arguments,
				)
				connection.send({
					type: "mcpResponse",
					payload: result,
				})
				break

			case "mcpResourceRequest":
				if (!message.payload?.serverName || !message.payload?.uri) {
					throw new Error("Invalid MCP resource request")
				}
				const resource = await mcpManager.readResource(message.payload.serverName, message.payload.uri)
				connection.send({
					type: "mcpResourceResponse",
					payload: resource,
				})
				break

			default:
				console.warn("Unknown message type:", message.type)
		}
	} catch (error: any) {
		console.error("Error handling message:", error)
		connection.send({
			type: "error",
			payload: error instanceof Error ? error.message : "Unknown error",
		})
	}
})

// WebSocket接続のハンドリング
wss.onConnection((connection: WebSocketConnection) => {
	console.log(`New WebSocket connection: ${connection.id}`)
})

// Start HTTP server
app.listen(port, () => {
	console.log(`HTTP server listening on port ${port}`)
	console.log(`WebSocket server running at ws://localhost:${wsPort}`)
})

// Handle process termination
process.on("SIGINT", () => {
	console.log("\nShutting down server...")
	wss.close()
	process.exit(0)
})

process.on("SIGTERM", () => {
	console.log("\nShutting down server...")
	wss.close()
	process.exit(0)
})
