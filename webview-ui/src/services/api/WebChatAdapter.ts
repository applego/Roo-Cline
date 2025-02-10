import { WebSocketClient } from "../websocket/WebSocketClient"
import { isStandaloneWeb } from "../../utils/environment"

interface WebSocketConfig {
	url: string
	token: string
}

export class WebChatAdapter {
	private webSocketClient: WebSocketClient | null = null

	private config: WebSocketConfig

	constructor(config: WebSocketConfig) {
		this.config = config
	}

	public async connect(): Promise<void> {
		if (!isStandaloneWeb()) {
			console.log("WebChat is only available in standalone web mode")
			return
		}

		try {
			// WebSocketClientのインスタンスを作成
			this.webSocketClient = new WebSocketClient(this.config.url)

			// トークンを使用した認証
			this.webSocketClient.on("connected", () => {
				this.webSocketClient?.send("authenticate", { token: this.config.token })
			})

			// 接続を開始
			this.webSocketClient.connect()
		} catch (error) {
			console.error("Failed to create WebChat connection:", error)
			throw error
		}
	}

	public send(type: string, payload?: any): void {
		if (!this.webSocketClient?.isConnected()) {
			console.error("WebChat is not connected")
			return
		}

		try {
			this.webSocketClient.send(type, payload)
		} catch (error) {
			console.error("Failed to send message:", error)
		}
	}

	public on(event: string, callback: (...args: any[]) => void): void {
		if (!this.webSocketClient) {
			console.error("WebChat is not initialized")
			return
		}
		this.webSocketClient.on(event, callback)
	}

	public off(event: string, callback: (...args: any[]) => void): void {
		if (!this.webSocketClient) {
			console.error("WebChat is not initialized")
			return
		}
		this.webSocketClient.off(event, callback)
	}

	// close()メソッドをdisconnect()としても使用可能に
	public disconnect(): void {
		this.close()
	}

	public close(): void {
		if (this.webSocketClient) {
			this.webSocketClient.close()
			this.webSocketClient = null
		}
	}

	public isConnected(): boolean {
		return this.webSocketClient?.isConnected() || false
	}

	public updateConfig(config: Partial<WebSocketConfig>): void {
		this.config = { ...this.config, ...config }

		// 設定が変更された場合、再接続が必要
		if (this.isConnected()) {
			this.disconnect()
			this.connect()
		}
	}
}

// シングルトンインスタンスを作成
export const webChatAdapter = new WebChatAdapter({
	url: import.meta.env.VITE_WS_URL || "ws://localhost:3000",
	token: import.meta.env.VITE_WS_TOKEN || "",
})
