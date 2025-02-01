import { WebSocket, WebSocketServer } from "ws"
import { ConfigStore } from "../config/ConfigStore"
import { McpManager } from "../mcp/McpManager"

export class WebSocketServerImpl {
	private wss: WebSocketServer | null = null
	private connections: Map<WebSocket, boolean> = new Map()
	private configStore: ConfigStore
	private mcpManager: McpManager

	constructor(configStore: ConfigStore, mcpManager: McpManager) {
		this.configStore = configStore
		this.mcpManager = mcpManager
	}

	setupWSServer() {
		this.wss = new WebSocketServer({ port: 8080 })
		this.wss.on("connection", this.onConnection.bind(this))
	}

	private onConnection(ws: WebSocket) {
		this.connections.set(ws, true)
		ws.on("message", (message: string) => this.onMessage(ws, message))
		ws.on("close", () => this.connections.delete(ws))
		ws.on("error", () => this.connections.delete(ws))
	}

	private async onMessage(ws: WebSocket, message: string) {
		try {
			const parsedMessage = JSON.parse(message)
			switch (parsedMessage.type) {
				case "upsertApiConfiguration":
					await this.configStore.saveConfig(parsedMessage.data)
					this.send(ws, {
						type: "configurationUpdated",
						data: parsedMessage.data,
					})
					break

				case "use_mcp_tool":
					const result = await this.mcpManager.useTool(parsedMessage.data.tool, parsedMessage.data.params)
					this.send(ws, {
						type: "tool_response",
						data: result,
					})
					break

				case "getConfig":
					const config = await this.configStore.loadConfig()
					this.send(ws, {
						type: "configuration",
						data: config,
					})
					break

				default:
					this.send(ws, {
						type: "error",
						data: `Unknown message type: ${parsedMessage.type}`,
					})
			}
		} catch (error) {
			this.send(ws, {
				type: "error",
				data: error instanceof Error ? error.message : "Invalid JSON message",
			})
		}
	}

	broadcast(message: any) {
		for (const [ws] of this.connections) {
			if (ws.readyState === WebSocket.OPEN) {
				this.send(ws, message)
			}
		}
	}

	private send(ws: WebSocket, message: any) {
		ws.send(JSON.stringify(message))
	}

	close() {
		if (this.wss) {
			this.wss.close()
			this.wss = null
		}
		this.connections.clear()
	}
}
