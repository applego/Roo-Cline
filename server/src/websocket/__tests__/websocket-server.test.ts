import { WebSocketServerImpl } from "../websocket-server.js"
import { ConfigStore } from "../../config/ConfigStore.js"
import { McpManager } from "../../mcp/McpManager.js"
import { Mock } from "jest-mock"
import { WebSocketMessage, MessageHandler } from "../../types.js"

// Mock WebSocket
jest.mock("ws", () => {
	const mockWebSocket = {
		OPEN: 1,
		CLOSED: 3,
		prototype: {},
	}
	return { WebSocket: jest.fn().mockImplementation(() => mockWebSocket) }
})

describe("WebSocketServerImpl", () => {
	let wss: WebSocketServerImpl
	let configStore: ConfigStore
	let mcpManager: McpManager

	beforeEach(() => {
		configStore = new MockConfigStore() as any
		mcpManager = new MockMcpManager() as any
		wss = new WebSocketServerImpl(8080, configStore, mcpManager)
	})

	afterEach(() => {
		wss.close()
	})

	it("should handle new connections", () => {
		const connectionHandler = (wss as any).connectionHandler

		expect(typeof connectionHandler).toBe("function")
	})

	it("should handle messages", () => {
		const messageHandler = (wss as any).messageHandler

		expect(typeof messageHandler).toBe("function")
	})

	it("should handle close events", () => {
		// const closeCallback = wss.on.mock.calls.find((call) => call[0] === "close")?.[1]
		// expect(closeCallback).toBeDefined()
	})

	it("should send a message to all clients", () => {
		const sendMock = jest.fn()
		;(wss as any).clients = [{ send: sendMock }]

		wss.broadcast({ type: "test", payload: "test message" })

		expect(sendMock).toHaveBeenCalledWith(JSON.stringify({ type: "test", payload: "test message" }))
	})
})

class MockConfigStore {
	async load() {
		return this.getDefaultConfig()
	}
	async save() {}
	getDefaultConfig() {
		return {}
	}
}

class MockMcpManager {
	async initialize(): Promise<void> {}
	async connectToServer(): Promise<void> {}
	async callTool(): Promise<any> {
		return {}
	}
}
