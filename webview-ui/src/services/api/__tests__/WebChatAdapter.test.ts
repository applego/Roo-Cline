import { WebChatAdapter } from "../WebChatAdapter"
import { isStandaloneWeb } from "../../../utils/environment"
import { WebSocketClient } from "../../websocket/WebSocketClient"

// isStandaloneWebをモック
jest.mock("../../../utils/environment", () => ({
	isStandaloneWeb: jest.fn(),
}))

// WebSocketClientをモック
jest.mock("../../websocket/WebSocketClient")

describe("WebChatAdapter", () => {
	let adapter: WebChatAdapter
	const mockConfig = {
		url: "ws://test.com",
		token: "test-token",
	}

	beforeEach(() => {
		// モックをリセット
		jest.clearAllMocks()
		;(isStandaloneWeb as jest.Mock).mockReturnValue(true)
		adapter = new WebChatAdapter(mockConfig)
	})

	describe("connect", () => {
		it("should create WebSocketClient and connect when in standalone mode", async () => {
			// WebSocketClientのインスタンスメソッドをモック
			const mockOn = jest.fn()
			const mockConnect = jest.fn()
			;(WebSocketClient as jest.Mock).mockImplementation(() => ({
				on: mockOn,
				connect: mockConnect,
			}))

			await adapter.connect()

			expect(WebSocketClient).toHaveBeenCalledWith(mockConfig.url)
			expect(mockOn).toHaveBeenCalledWith("connected", expect.any(Function))
			expect(mockConnect).toHaveBeenCalled()
		})

		it("should not connect when not in standalone mode", async () => {
			;(isStandaloneWeb as jest.Mock).mockReturnValue(false)

			await adapter.connect()

			expect(WebSocketClient).not.toHaveBeenCalled()
		})
	})

	describe("send", () => {
		it("should send message when connected", () => {
			const mockSend = jest.fn()
			const mockIsConnected = jest.fn().mockReturnValue(true)
			;(WebSocketClient as jest.Mock).mockImplementation(() => ({
				send: mockSend,
				isConnected: mockIsConnected,
			}))

			// WebSocketClientを初期化
			adapter["webSocketClient"] = new WebSocketClient()

			adapter.send("test", { data: "test" })

			expect(mockSend).toHaveBeenCalledWith("test", { data: "test" })
		})

		it("should not send message when not connected", () => {
			const mockSend = jest.fn()
			const mockIsConnected = jest.fn().mockReturnValue(false)
			;(WebSocketClient as jest.Mock).mockImplementation(() => ({
				send: mockSend,
				isConnected: mockIsConnected,
			}))

			// WebSocketClientを初期化
			adapter["webSocketClient"] = new WebSocketClient()

			adapter.send("test", { data: "test" })

			expect(mockSend).not.toHaveBeenCalled()
		})
	})

	describe("disconnect/close", () => {
		it("should close WebSocketClient connection", () => {
			const mockClose = jest.fn()
			;(WebSocketClient as jest.Mock).mockImplementation(() => ({
				close: mockClose,
			}))

			// WebSocketClientを初期化
			adapter["webSocketClient"] = new WebSocketClient()

			adapter.disconnect()

			expect(mockClose).toHaveBeenCalled()
			expect(adapter["webSocketClient"]).toBeNull()
		})
	})

	describe("updateConfig", () => {
		it("should update config and reconnect if connected", () => {
			const mockIsConnected = jest.fn().mockReturnValue(true)
			const mockClose = jest.fn()
			;(WebSocketClient as jest.Mock).mockImplementation(() => ({
				isConnected: mockIsConnected,
				close: mockClose,
			}))

			// WebSocketClientを初期化
			adapter["webSocketClient"] = new WebSocketClient()

			const newConfig = { url: "ws://new.test.com" }
			adapter.updateConfig(newConfig)

			expect(adapter["config"]).toEqual({ ...mockConfig, ...newConfig })
			expect(mockClose).toHaveBeenCalled()
		})
	})
})
