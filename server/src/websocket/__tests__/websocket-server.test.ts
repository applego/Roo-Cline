import { WebSocketServerImpl } from "../websocket-server"
import { ConfigStore } from "../../config/ConfigStore"
import { McpManager } from "../../mcp/McpManager"
import { WebSocket } from "ws"
import { MessageHandler } from "../../types"
import path from "path"

jest.mock("ws", () => ({
	WebSocket: {
		OPEN: 1,
	},
	WebSocketServer: jest.fn().mockImplementation(() => ({
		on: jest.fn(),
		close: jest.fn(),
	})),
}))

class MockConfigStore extends ConfigStore {
	constructor() {
		super(path.join(__dirname, "test-config"))
	}

	override async load() {
		return this.getDefaultConfig()
	}

	override async save() {
		// テスト用のモックなので何もしない
	}
}

class MockMcpManager extends McpManager {
	constructor() {
		const configStore = new MockConfigStore()
		super(configStore)
	}

	override async initialize(): Promise<void> {
		// テスト用のモックなので何もしない
	}

	override async connectToServer(): Promise<void> {
		// テスト用のモックなので何もしない
	}

	override async callTool(): Promise<any> {
		return {
			content: [{ type: "text", text: "mock result" }],
		}
	}
}

describe("WebSocketServerImpl", () => {
	let server: WebSocketServerImpl
	let mockConfigStore: ConfigStore
	let mockMcpManager: McpManager
	let mockMessageHandler: MessageHandler
	let mockWs: any
	let connectionId: string

	beforeEach(() => {
		mockConfigStore = new MockConfigStore()
		mockMcpManager = new MockMcpManager()
		mockMessageHandler = jest.fn()
		connectionId = "test-connection-id"

		mockWs = {
			on: jest.fn(),
			send: jest.fn(),
			readyState: WebSocket.OPEN,
			connectionId,
		}

		server = new WebSocketServerImpl(8080, mockConfigStore, mockMcpManager)
		server.onMessage(mockMessageHandler)
	})

	afterEach(() => {
		server.close()
		jest.clearAllMocks()
	})

	describe("レート制限テスト", () => {
		let messageCallback: ((data: string) => void) | undefined
		let closeCallback: (() => void) | undefined

		beforeEach(() => {
			mockWs.on.mockImplementation((event: string, cb: any) => {
				if (event === "message") {
					messageCallback = cb
				} else if (event === "close") {
					closeCallback = cb
				}
			})

			// connection イベントのコールバックを実行
			const wss = (server as any).wss
			const connectionCallback = wss.on.mock.calls.find((call) => call[0] === "connection")?.[1]

			if (connectionCallback) {
				connectionCallback(mockWs)
			}
		})

		it("レート制限内のリクエストを許可する", async () => {
			expect(messageCallback).toBeDefined()
			if (!messageCallback) return

			// 10回までのリクエストは許可される
			for (let i = 0; i < 10; i++) {
				await messageCallback(JSON.stringify({ type: "test" }))
				expect(mockMessageHandler).toHaveBeenCalledTimes(i + 1)
			}
		})

		it("レート制限を超えたリクエストをブロックする", async () => {
			expect(messageCallback).toBeDefined()
			if (!messageCallback) return

			// 10回リクエストを送信
			for (let i = 0; i < 10; i++) {
				await messageCallback(JSON.stringify({ type: "test" }))
			}

			// 11回目のリクエストはブロックされる
			await messageCallback(JSON.stringify({ type: "test" }))
			expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining("RATE_LIMIT_EXCEEDED"))
			expect(mockMessageHandler).toHaveBeenCalledTimes(10)
		})

		it("接続切断時にレート制限カウンターがリセットされる", async () => {
			expect(messageCallback).toBeDefined()
			expect(closeCallback).toBeDefined()
			if (!messageCallback || !closeCallback) return

			// 10回リクエストを送信
			for (let i = 0; i < 10; i++) {
				await messageCallback(JSON.stringify({ type: "test" }))
			}

			// コネクションクローズをシミュレート
			closeCallback()

			// 新しいコネクションで再度リクエスト可能
			const wss = (server as any).wss
			const connectionCallback = wss.on.mock.calls.find((call) => call[0] === "connection")?.[1]

			if (connectionCallback) {
				connectionCallback(mockWs)
				await messageCallback(JSON.stringify({ type: "test" }))
				expect(mockMessageHandler).toHaveBeenCalledTimes(11)
			}
		})

		it("レート制限情報を取得できる", () => {
			const info = server.getRateLimitInfo(connectionId)

			expect(info).toHaveProperty("remainingRequests")
			expect(info).toHaveProperty("nextRequestDelay")
			expect(info.remainingRequests).toBe(10)
			expect(info.nextRequestDelay).toBe(0)
		})
	})

	it("メッセージを正常に処理する", async () => {
		const message = { type: "test", payload: "data" }
		let messageCallback: ((data: string) => void) | undefined

		mockWs.on.mockImplementation((event: string, cb: any) => {
			if (event === "message") {
				messageCallback = cb
			}
		})

		const wss = (server as any).wss
		const connectionCallback = wss.on.mock.calls.find((call) => call[0] === "connection")?.[1]

		if (connectionCallback && messageCallback) {
			connectionCallback(mockWs)
			await messageCallback(JSON.stringify(message))

			expect(mockMessageHandler).toHaveBeenCalledWith(message, expect.any(Object))
		}
	})

	it("無効なメッセージでエラーを返す", async () => {
		let messageCallback: ((data: string) => void) | undefined

		mockWs.on.mockImplementation((event: string, cb: any) => {
			if (event === "message") {
				messageCallback = cb
			}
		})

		const wss = (server as any).wss
		const connectionCallback = wss.on.mock.calls.find((call) => call[0] === "connection")?.[1]

		if (connectionCallback && messageCallback) {
			connectionCallback(mockWs)
			await messageCallback("invalid json")

			expect(mockWs.send).toHaveBeenCalledWith(expect.stringContaining("Invalid message format"))
		}
	})
})
