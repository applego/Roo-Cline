import { CommunicationHandler } from "../../types"

export class CommunicationFactory {
	private currentHandler: CommunicationHandler | null = null
	private _messageCallback: (message: any) => void = () => {}

	constructor() {
		if (typeof window !== "undefined" && window.acquireVsCodeApi) {
			// VSCode環境での処理
			const vscode = window.acquireVsCodeApi()
			this.currentHandler = {
				send: async (message: any) => {
					vscode.postMessage(message)
				},
				onMessage: (callback: (message: any) => void) => {
					window.addEventListener("message", (event) => {
						callback(event.data)
					})
				},
				_messageCallback: this._messageCallback,
				_isPolling: false,
				_lastMessageId: "",
				_url: "",
				_ws: null,
				_reconnectAttempts: 0,
				_maxReconnectAttempts: 5,
				_reconnectDelay: 1000,
				_isConnected: false,
				_pendingMessages: [],
				connect: async () => {},
				disconnect: () => {},
			}
		} else {
			// ブラウザ環境での処理
			this.currentHandler = {
				send: async (message: any) => {
					console.log("Mock message sent:", message)
					return Promise.resolve()
				},
				onMessage: (callback: (message: any) => void) => {
					this._messageCallback = callback
				},
				_messageCallback: this._messageCallback,
				_isPolling: false,
				_lastMessageId: "",
				_url: "",
				_ws: null,
				_reconnectAttempts: 0,
				_maxReconnectAttempts: 5,
				_reconnectDelay: 1000,
				_isConnected: false,
				_pendingMessages: [],
				connect: async () => {},
				disconnect: () => {},
			}
		}
	}

	getHandler(): CommunicationHandler {
		if (!this.currentHandler) {
			throw new Error("No communication handler available")
		}
		return this.currentHandler
	}
}
