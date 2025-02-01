import { WebSocketServerImpl } from "../websocket-server"
import { ConfigStore } from "../../config/ConfigStore"
import { McpManager } from "../../mcp/McpManager"
import { WebSocket, WebSocketServer } from "ws"
import { EventEmitter } from "events"

// モックの定義
const mockSend = jest.fn()
const mockOn = jest.fn()
const mockClose = jest.fn()

class MockWebSocket extends EventEmitter {
	static OPEN = WebSocket.OPEN
	static CLOSED = WebSocket.CLOSED
	readyState: number
	send: jest.Mock
	on: jest.Mock

	constructor() {
		super()
		this.readyState = MockWebSocket.OPEN
		this.send = mockSend
		this.on = mockOn
	}
}

class MockWebSocketServer extends EventEmitter {
	clients: Set<MockWebSocket>
	on: jest.Mock
	close: jest.Mock

	constructor() {
		super()
		this.clients = new Set()
		this.on = mockOn
		this.close = mockClose
	}

	addClient(client: MockWebSocket) {
		this.clients.add(client)
		this.emit("connection", client)
	}
}

// モックの設定
jest.mock("ws", () => ({
	WebSocket: jest.fn().mockImplementation(() => new MockWebSocket()),
	WebSocketServer: jest.fn().mockImplementation(() => new MockWebSocketServer()),
}))

jest.mock("../../config/ConfigStore")
jest.mock("../../mcp/McpManager")

describe("WebSocketServerImpl", () => {
	let server: WebSocketServerImpl
	let mockWss: MockWebSocketServer
	let mockWs: MockWebSocket
	let configStore: jest.Mocked<ConfigStore>
	let mcpManager: jest.Mocked<McpManager>

	beforeEach(() => {
		jest.clearAllMocks()
		mockWss = new MockWebSocketServer()
		mockWs = new MockWebSocket()
		configStore = new ConfigStore() as jest.Mocked<ConfigStore>
		mcpManager = new McpManager() as jest.Mocked<McpManager>
		server = new WebSocketServerImpl(configStore, mcpManager)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("connection management", () => {
		it("should handle new connections", () => {
			server.setupWSServer()
			mockWss.addClient(mockWs)

			expect(mockOn).toHaveBeenCalledWith("connection", expect.any(Function))
			expect(mockOn).toHaveBeenCalledWith("message", expect.any(Function))
			expect(mockOn).toHaveBeenCalledWith("close", expect.any(Function))
			expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function))
		})

		it("should handle connection close", () => {
			server.setupWSServer()
			mockWss.addClient(mockWs)
			mockWs.emit("close")

			expect(mockOn).toHaveBeenCalledWith("close", expect.any(Function))
		})

		it("should handle connection errors", () => {
			const mockError = new Error("Test error")
			server.setupWSServer()
			mockWss.addClient(mockWs)
			mockWs.emit("error", mockError)

			expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function))
		})

		it("should broadcast messages to all connections", () => {
			const mockWs2 = new MockWebSocket()
			const message = { type: "test", data: "test data" }

			server.setupWSServer()
			mockWss.addClient(mockWs)
			mockWss.addClient(mockWs2)

			server.broadcast(message)

			expect(mockSend).toHaveBeenCalledWith(JSON.stringify(message))
			expect(mockSend).toHaveBeenCalledTimes(2)
		})

		it("should not send to closed connections during broadcast", () => {
			const mockWs2 = new MockWebSocket()
			const message = { type: "test", data: "test data" }

			server.setupWSServer()
			mockWss.addClient(mockWs)
			mockWss.addClient(mockWs2)

			mockWs2.readyState = MockWebSocket.CLOSED

			server.broadcast(message)

			expect(mockSend).toHaveBeenCalledWith(JSON.stringify(message))
			expect(mockSend).toHaveBeenCalledTimes(1)
		})
	})

	describe("message handling", () => {
		it("should handle invalid JSON message", () => {
			server.setupWSServer()
			mockWss.addClient(mockWs)

			const invalidMessage = "invalid json"
			mockWs.emit("message", invalidMessage)

			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					type: "error",
					data: expect.stringContaining("Invalid JSON"),
				}),
			)
		})

		it("should handle upsertApiConfiguration message", async () => {
			const config = { apiKey: "test-key", endpoint: "test-endpoint" }
			const message = {
				type: "upsertApiConfiguration",
				data: config,
			}

			server.setupWSServer()
			mockWss.addClient(mockWs)

			configStore.saveConfig.mockResolvedValueOnce(undefined)

			mockWs.emit("message", JSON.stringify(message))

			expect(configStore.saveConfig).toHaveBeenCalledWith(config)
			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					type: "configurationUpdated",
					data: config,
				}),
			)
		})

		it("should handle use_mcp_tool message", async () => {
			const toolRequest = {
				tool: "test-tool",
				params: { param1: "value1" },
			}
			const message = {
				type: "use_mcp_tool",
				data: toolRequest,
			}
			const toolResponse = { result: "success" }

			server.setupWSServer()
			mockWss.addClient(mockWs)

			mcpManager.useTool.mockResolvedValueOnce(toolResponse)

			mockWs.emit("message", JSON.stringify(message))

			expect(mcpManager.useTool).toHaveBeenCalledWith(toolRequest.tool, toolRequest.params)
			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					type: "tool_response",
					data: toolResponse,
				}),
			)
		})

		it("should handle getConfig message", async () => {
			const config = { apiKey: "test-key", endpoint: "test-endpoint" }
			const message = { type: "getConfig" }

			server.setupWSServer()
			mockWss.addClient(mockWs)

			configStore.loadConfig.mockResolvedValueOnce(config)

			mockWs.emit("message", JSON.stringify(message))

			expect(configStore.loadConfig).toHaveBeenCalled()
			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					type: "configuration",
					data: config,
				}),
			)
		})

		it("should handle unknown message type", () => {
			const message = {
				type: "unknown",
				data: {},
			}

			server.setupWSServer()
			mockWss.addClient(mockWs)

			mockWs.emit("message", JSON.stringify(message))

			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					type: "error",
					data: expect.stringContaining("Unknown message type"),
				}),
			)
		})

		it("should handle errors during message processing", async () => {
			const config = { apiKey: "test-key", endpoint: "test-endpoint" }
			const message = {
				type: "upsertApiConfiguration",
				data: config,
			}
			const error = new Error("Test error")

			server.setupWSServer()
			mockWss.addClient(mockWs)

			configStore.saveConfig.mockRejectedValueOnce(error)

			mockWs.emit("message", JSON.stringify(message))

			expect(mockSend).toHaveBeenCalledWith(
				JSON.stringify({
					type: "error",
					data: expect.stringContaining("Test error"),
				}),
			)
		})
	})
})
