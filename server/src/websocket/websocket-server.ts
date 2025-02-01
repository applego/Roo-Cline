import { WebSocket, WebSocketServer as WSServer } from "ws"
import { v4 as uuidv4 } from "uuid"
import { WebSocketMessage, WebSocketServer, WebSocketConnection, MessageHandler } from "../types"
import { ConfigStore } from "../config/ConfigStore"
import { McpManager } from "../mcp/McpManager"
import { MessageRouter } from "./message-handler"

export class WebSocketServerImpl implements WebSocketServer {
	private wss: WSServer
	private connections: Map<string, WebSocket> = new Map()
	private messageHandler?: MessageHandler
	private connectionHandler?: (connection: WebSocketConnection) => void
	private configStore: ConfigStore
	private mcpManager: McpManager
	private messageRouter: MessageRouter

	constructor(port: number, configStore: ConfigStore, mcpManager: McpManager) {
		this.wss = new WSServer({ port })
		this.configStore = configStore
		this.mcpManager = mcpManager
		this.messageRouter = new MessageRouter(configStore, mcpManager)
		this.messageHandler = this.messageRouter.createMessageHandler()
		this.setupWSServer()
	}

	private setupWSServer(): void {
		this.wss.on("connection", (ws: WebSocket) => {
			const connectionId = uuidv4()
			this.connections.set(connectionId, ws)

			const connection: WebSocketConnection = {
				id: connectionId,
				send: (message: WebSocketMessage) => {
					if (ws.readyState === WebSocket.OPEN) {
						ws.send(JSON.stringify(message))
					}
				},
			}

			ws.on("message", async (data: string) => {
				try {
					const message: WebSocketMessage = JSON.parse(data)
					if (this.messageHandler) {
						await this.messageHandler(message, connection)
					}
				} catch (error) {
					console.error("Error handling message:", error)
					ws.send(JSON.stringify({ type: "error", payload: "Invalid message format" }))
				}
			})

			ws.on("close", () => {
				this.connections.delete(connectionId)
			})

			ws.on("error", (error) => {
				console.error("WebSocket error:", error)
				this.connections.delete(connectionId)
			})

			if (this.connectionHandler) {
				this.connectionHandler(connection)
			}
		})

		this.wss.on("error", (error) => {
			console.error("WebSocket server error:", error)
		})
	}

	broadcast(message: WebSocketMessage): void {
		const messageString = JSON.stringify(message)
		this.connections.forEach((ws) => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.send(messageString)
			}
		})
	}

	send(connectionId: string, message: WebSocketMessage): void {
		const ws = this.connections.get(connectionId)
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message))
		}
	}

	onConnection(handler: (connection: WebSocketConnection) => void): void {
		this.connectionHandler = handler
	}

	onMessage(handler: MessageHandler): void {
		this.messageHandler = handler
	}

	close(): void {
		this.wss.close()
	}
}
