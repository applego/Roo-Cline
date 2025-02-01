import { WebSocketMessage, WebSocketConnection, MessageHandler, FileOperation } from "../types"
import { ConfigStore } from "../config/ConfigStore"
import { McpManager } from "../mcp/McpManager"
import { FileManager } from "../core/FileManager"
import path from "path"

export class MessageRouter {
	private configStore: ConfigStore
	private mcpManager: McpManager
	private fileManager: FileManager

	constructor(configStore: ConfigStore, mcpManager: McpManager) {
		this.configStore = configStore
		this.mcpManager = mcpManager

		// 許可されたパスとログファイルのパスを設定
		const allowedPaths = [
			path.resolve(process.cwd(), "workspace"), // ワークスペースディレクトリ
			path.resolve(process.cwd(), "uploads"), // アップロードディレクトリ
		]
		const auditLogPath = path.resolve(process.cwd(), "logs", "file-operations.log")

		this.fileManager = new FileManager(allowedPaths, auditLogPath)
	}

	public createMessageHandler(): MessageHandler {
		return async (message: WebSocketMessage, connection: WebSocketConnection) => {
			try {
				switch (message.type) {
					case "upsertApiConfiguration":
						await this.handleUpsertApiConfig(message.payload, connection)
						break
					case "use_mcp_tool":
						await this.handleMcpToolCall(message.payload, connection)
						break
					case "getConfig":
						await this.handleGetConfig(connection)
						break
					case "fileOperation":
						await this.handleFileOperation(message.payload, connection)
						break
					default:
						connection.send({
							type: "error",
							payload: `Unsupported message type: ${message.type}`,
						})
				}
			} catch (error) {
				console.error(`Error handling message type ${message.type}:`, error)
				connection.send({
					type: "error",
					payload: error instanceof Error ? error.message : "Unknown error occurred",
				})
			}
		}
	}

	private async handleUpsertApiConfig(payload: any, connection: WebSocketConnection): Promise<void> {
		const config = await this.configStore.load()
		config.apiConfig = {
			...config.apiConfig,
			...payload,
		}
		await this.configStore.save(config)
		connection.send({
			type: "apiConfigurationUpdated",
			payload: config.apiConfig,
		})
	}

	private async handleMcpToolCall(payload: any, connection: WebSocketConnection): Promise<void> {
		const { serverName, toolName, args } = payload
		const result = await this.mcpManager.callTool(serverName, toolName, args)
		connection.send({
			type: "mcpToolResult",
			payload: result,
		})
	}

	private async handleGetConfig(connection: WebSocketConnection): Promise<void> {
		const config = await this.configStore.load()
		connection.send({
			type: "config",
			payload: config,
		})
	}

	private async handleFileOperation(payload: FileOperation, connection: WebSocketConnection): Promise<void> {
		try {
			const result = await this.fileManager.executeOperation(payload)
			connection.send({
				type: "fileOperationResult",
				payload: result,
			})
		} catch (error) {
			connection.send({
				type: "error",
				payload: error instanceof Error ? error.message : "Unknown error occurred",
			})
		}
	}
}
