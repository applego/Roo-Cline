import EventEmitter from "../../utils/EventEmitter"
import { isStandaloneWeb } from "../../utils/environment"

interface WebSocketMessage {
	type: string
	payload?: any
}

interface WebSocketConfig {
	url: string
	token?: string
	maxReconnectAttempts?: number
	reconnectDelay?: number
}

export class WebSocketClient {
	private ws: WebSocket | null = null
	private eventEmitter: EventEmitter
	private reconnectAttempts = 0
	private maxReconnectAttempts = 5
	private reconnectDelay = 1000 // ミリ秒
	private config: WebSocketConfig

	constructor(config: WebSocketConfig = { url: import.meta.env.VITE_WS_URL || "ws://localhost:3001" }) {
		// Changed to 3001
		this.config = config
		this.eventEmitter = new EventEmitter()
	}

	public connect(): void {
		if (!isStandaloneWeb()) {
			console.log("WebSocket is only available in standalone web mode")
			return
		}

		try {
			this.ws = new WebSocket(this.config.url)
			this.setupEventListeners()
		} catch (error) {
			console.error("Failed to create WebSocket connection:", error)
			this.handleReconnect()
		}
	}

	private setupEventListeners(): void {
		if (!this.ws) return

		this.ws.onopen = () => {
			console.log("WebSocket connected")
			this.reconnectAttempts = 0
			this.eventEmitter.emit("connected")
		}

		this.ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as WebSocketMessage
				this.eventEmitter.emit("message", message)
				this.eventEmitter.emit(message.type, message.payload)
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error)
			}
		}

		this.ws.onclose = () => {
			console.log("WebSocket disconnected")
			this.eventEmitter.emit("disconnected")
			this.handleReconnect()
		}

		this.ws.onerror = (error) => {
			console.error("WebSocket error:", error)
			this.eventEmitter.emit("error", error)
		}
	}

	private handleReconnect(): void {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error("Max reconnection attempts reached")
			this.eventEmitter.emit("maxReconnectAttemptsReached")
			return
		}

		this.reconnectAttempts++
		console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

		setTimeout(() => {
			this.connect()
		}, this.reconnectDelay * this.reconnectAttempts)
	}

	public send(type: string, payload?: any): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			console.error("WebSocket is not connected")
			return
		}

		try {
			const message: WebSocketMessage = { type, payload }
			this.ws.send(JSON.stringify(message))
		} catch (error) {
			console.error("Failed to send message:", error)
		}
	}

	public on(event: string, callback: (...args: any[]) => void): void {
		this.eventEmitter.on(event, callback)
	}

	public off(event: string, callback: (...args: any[]) => void): void {
		this.eventEmitter.off(event, callback)
	}

	public close(): void {
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
	}

	// 接続状態を確認
	public isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN
	}

	// 再接続試行回数をリセット
	public resetReconnectAttempts(): void {
		this.reconnectAttempts = 0
	}

	// 設定を更新
	public updateConfig(config: { maxReconnectAttempts?: number; reconnectDelay?: number }): void {
		if (config.maxReconnectAttempts !== undefined) {
			this.maxReconnectAttempts = config.maxReconnectAttempts
		}
		if (config.reconnectDelay !== undefined) {
			this.reconnectDelay = config.reconnectDelay
		}
	}
}

// シングルトンインスタンスを作成
export const webSocketClient = new WebSocketClient()
