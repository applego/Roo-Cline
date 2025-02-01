import { WebSocketServerImpl } from "../websocket-server"
import { ConfigStore } from "../../config/ConfigStore"
import { McpManager } from "../../mcp/McpManager"
import { WebSocketMessage } from "../../types"
import { MockWebSocket, MockWebSocketServer, mockWebSocket, mockWebSocketServer } from "./mock-websocket"

jest.mock("ws", () => ({
	WebSocket: mockWebSocket,
	WebSocketServer: mockWebSocketServer,
}))
jest.mock("../../config/ConfigStore")
jest.mock("../../mcp/McpManager")

describe("WebSocketServerImpl", () => {
	let server: WebSocketServerImpl
	let configStore: jest.Mocked<ConfigStore>
	let mcpManager: jest.Mocked<McpManager>
	let mockWss: MockWebSocketServer
	const TEST_PORT = 8080

	beforeEach(() => {
		configStore = new ConfigStore("") as jest.Mocked<ConfigStore>
		mcpManager = new McpManager() as jest.Mocked<McpManager>
		server = new WebSocketServerImpl(TEST_PORT, configStore, mcpManager)
		mockWss = (server as any).wss
	})

	afterEach(() => {
		server.close()
		jest.clearAllMocks()
	})

	describe("connection management", () => {
		it("should handle new connections", () => {
			const mockWs = new MockWebSocket()
			const mockConnectionHandler = jest.fn()

			server.onConnection(mockConnectionHandler)
			mockWss.addClient(mockWs)

			expect(mockConnectionHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					id: expect.any(String),
					send: expect.any(Function),
				}),
			)
		})

		it("should handle connection close", () => {
			const mockWs = new MockWebSocket()
			mockWss.addClient(mockWs)

			mockWs.emit("close")

			expect((server as any).connections.size).toBe(0)
		})

		it("should handle connection errors", () => {
			const mockWs = new MockWebSocket()
			const mockError = new Error("Test connection error")

			mockWss.addClient(mockWs)
			mockWs.emit("error", mockError)

			expect((server as any).connections.size).toBe(0)
		})

		it("should broadcast messages to all connections", () => {
			const mockWs1 = new MockWebSocket()
			const mockWs2 = new MockWebSocket()

			mockWss.addClient(mockWs1)
			mockWss.addClient(mockWs2)

			const testMessage: WebSocketMessage = {
				type: "test",
				payload: "test data",
			}

			server.broadcast(testMessage)

			expect(mockWs1.send).toHaveBeenCalledWith(JSON.stringify(testMessage))
			expect(mockWs2.send).toHaveBeenCalledWith(JSON.stringify(testMessage))
		})

		it("should not send to closed connections during broadcast", () => {
			const mockWs1 = new MockWebSocket()
			const mockWs2 = new MockWebSocket()
			mockWs2.readyState = MockWebSocket.CLOSED

			mockWss.addClient(mockWs1)
			mockWss.addClient(mockWs2)

			const testMessage: WebSocketMessage = {
				type: "test",
				payload: "test data",
			}

			server.broadcast(testMessage)

			expect(mockWs1.send).toHaveBeenCalledWith(JSON.stringify(testMessage))
			expect(mockWs2.send).not.toHaveBeenCalled()
		})
	})

	describe("message handling", () => {
		let mockWs: MockWebSocket

		beforeEach(() => {
			mockWs = new MockWebSocket()
			mockWss.addClient(mockWs)
		})

		it("should handle invalid JSON message", () => {
			mockWs.emit("message", "invalid json")

			expect(mockWs.send).toHaveBeenCalledWith(
				JSON.stringify({
					type: "error",
					payload: "Invalid message format",
				}),
			)
		})

		it("should handle upsertApiConfiguration message", async () => {
			const mockConfig = {
				apiConfig: {
					default: {
						provider: "openai",
						apiKey: "test-key",
					},
				},
			}
			configStore.load.mockResolvedValue(mockConfig)

			const message: WebSocketMessage = {
				type: "upsertApiConfiguration",
				payload: {
					default: {
						provider: "openai",
						apiKey: "new-key",
					},
				},
			}

			mockWs.emit("message", JSON.stringify(message))

			await new Promise(process.nextTick) // メッセージ処理の完了を待つ

			expect(configStore.save).toHaveBeenCalledWith(
				expect.objectContaining({
					apiConfig: expect.objectContaining({
						default: expect.objectContaining({
							provider: "openai",
							apiKey: "new-key",
						}),
					}),
				}),
			)

			expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining("apiConfigurationUpdated"))
		})

		it("should handle use_mcp_tool message", async () => {
			const mockToolResult = { success: true, data: "test result" }
			mcpManager.callTool.mockResolvedValue(mockToolResult)

			const message: WebSocketMessage = {
				type: "use_mcp_tool",
				payload: {
					serverName: "test-server",
					toolName: "test-tool",
					args: { test: "arg" },
				},
			}

			mockWs.emit("message", JSON.stringify(message))

			await new Promise(process.nextTick)

			expect(mcpManager.callTool).toHaveBeenCalledWith("test-server", "test-tool", { test: "arg" })

			expect(mockWs.send).toHaveBeenCalledWith(
				JSON.stringify({
					type: "mcpToolResult",
					payload: mockToolResult,
				}),
			)
		})

		it("should handle getConfig message", async () => {
			const mockConfig = {
				preferredLanguage: "ja",
				customInstructions: "",
				modePrompts: {},
				apiConfig: {
					default: {
						provider: "openai",
						apiKey: "test-key",
					},
				},
			}
			configStore.load.mockResolvedValue(mockConfig)

			const message: WebSocketMessage = {
				type: "getConfig",
			}

			mockWs.emit("message", JSON.stringify(message))

			await new Promise(process.nextTick)

			expect(configStore.load).toHaveBeenCalled()
			expect(mockWs.send).toHaveBeenCalledWith(
				JSON.stringify({
					type: "config",
					payload: mockConfig,
				}),
			)
		})

		it("should handle unknown message type", async () => {
			const message: WebSocketMessage = {
				type: "unknownType",
			}

			mockWs.emit("message", JSON.stringify(message))

			await new Promise(process.nextTick)

			expect(mockWs.send).toHaveBeenCalledWith(
				JSON.stringify({
					type: "error",
					payload: expect.stringContaining("Unsupported message type"),
				}),
			)
		})

		it("should handle errors during message processing", async () => {
			const mockError = new Error("Test error")
			configStore.load.mockRejectedValue(mockError)

			const message: WebSocketMessage = {
				type: "getConfig",
			}

			mockWs.emit("message", JSON.stringify(message))

			await new Promise(process.nextTick)

			expect(mockWs.send).toHaveBeenCalledWith(
				JSON.stringify({
					type: "error",
					payload: "Test error",
				}),
			)
		})
	})
})
