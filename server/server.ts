import express from "express"
import cors from "cors"
import { WebSocketServerImpl } from "./websocket/websocket-server"
import { WebSocketMessage } from "./types"
import { ConfigStore } from "./config/ConfigStore"
import { McpManager } from "./mcp/McpManager"
import path from "path"

const app = express()
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
const wsPort = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001

app.use(cors())
app.use(express.json())

// 静的ファイルの提供（webview-uiのビルド成果物）
app.use(express.static(path.join(__dirname, "../../webview-ui/build")))

// コンフィグストア
const configStore = new ConfigStore(process.env.CONFIG_DIR || path.join(__dirname, "../config"))

// MCPマネージャー
const mcpManager = new McpManager()

// WebSocketサーバーのセットアップ
const wss = new WebSocketServerImpl(wsPort)

// クライアントからのメッセージを処理
wss.onMessage(async (message: WebSocketMessage, connection) => {
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
	} catch (error) {
		console.error("Error handling message:", error)
		connection.send({
			type: "error",
			payload: error instanceof Error ? error.message : "Unknown error",
		})
	}
})

// WebSocket接続のハンドリング
wss.onConnection((connection) => {
	console.log(`New WebSocket connection: ${connection.id}`)
})

// HTTPサーバーの起動
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`)
	console.log(`WebSocket server running at ws://localhost:${wsPort}`)
})

// シャットダウン時のクリーンアップ
process.on("SIGINT", () => {
	console.log("Shutting down...")
	wss.close()
	process.exit(0)
})
