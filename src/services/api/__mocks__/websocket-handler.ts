import { WebviewMessage } from "../../../types/messages"

export class WebSocketHandler {
	private _ws: WebSocket | null = null
	private _messageHandlers: ((message: WebviewMessage) => void)[] = []
	private _isConnected = false

	constructor(private _url: string) {
		this._connect()
	}

	private _connect() {
		this._isConnected = true
	}

	async send(message: WebviewMessage): Promise<void> {
		if (!this._isConnected) {
			throw new Error("WebSocket is not connected")
		}
		// モックの実装では即座にメッセージを処理
		this._messageHandlers.forEach((handler) => {
			handler({
				type: "response",
				payload: {
					id: message.payload?.id,
					success: true,
				},
			})
		})
		return Promise.resolve()
	}

	onMessage(handler: (message: WebviewMessage) => void) {
		this._messageHandlers.push(handler)
		// 初期メッセージを送信
		handler({
			type: "notification",
			payload: { message: "Connected to server" },
		})
	}

	removeMessageHandler(handler: (message: WebviewMessage) => void) {
		const index = this._messageHandlers.indexOf(handler)
		if (index !== -1) {
			this._messageHandlers.splice(index, 1)
		}
	}

	close() {
		this._isConnected = false
		this._messageHandlers = []
	}
}
