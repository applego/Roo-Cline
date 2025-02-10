import { WebSocketMessage, WebSocketConnection, MessageHandler, FileOperation } from "../types.js"
import { ConfigStore } from "../config/ConfigStore.js"
import { McpManager } from "../mcp/McpManager.js"
import { FileManager } from "../core/FileManager.js"

export class MessageRouter {
	constructor(
		private configStore: ConfigStore,
		private mcpManager: McpManager,
	) {}

	createMessageHandler(): MessageHandler {
		return async (message: WebSocketMessage, connection: WebSocketConnection) => {
			switch (message.type) {
				case "getConfig":
					const config = await this.configStore.load()
					connection.send({
						type: "config",
						payload: config,
					})
					break

				case "saveConfig":
					await this.configStore.save(message.payload)
					connection.send({
						type: "configSaved",
						payload: { success: true },
					})
					break

				case "mcpRequest":
					if (!message.payload?.serverName || !message.payload?.toolName) {
						throw new Error("Invalid MCP request")
					}
					const result = await this.mcpManager.callTool(
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
					const resource = await this.mcpManager.readResource(message.payload.serverName, message.payload.uri)
					connection.send({
						type: "mcpResourceResponse",
						payload: resource,
					})
					break

				default:
					console.warn("Unknown message type:", message.type)
			}
		}
	}
}
