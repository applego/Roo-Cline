import { CommunicationHandler, RestHandler } from "./types"
import { WebviewMessage } from "../../types/messages"

export class CommunicationFactory {
	private currentHandler: CommunicationHandler | null = null

	constructor() {
		if (typeof window !== "undefined" && window.acquireVsCodeApi) {
			// VSCode環境での処理
			const vscode = window.acquireVsCodeApi()
			this.currentHandler = {
				messageCallback: () => {},
				isPolling: false,
				lastMessageId: null,
				url: "",
				headers: {},
				pollInterval: 1000,
				retryCount: 0,
				maxRetries: 3,
				retryDelay: 1000,
				disposed: false,
				send: (message: WebviewMessage) => {
					vscode.postMessage(message)
					return Promise.resolve()
				},
				onMessage: () => {
					// VSCode specific message handling
				},
			} as RestHandler

			window.addEventListener("message", (event) => {
				const message = event.data
				if (this.currentHandler?.messageCallback) {
					this.currentHandler.messageCallback()
				}
			})
		} else {
			console.warn("VSCode API not available")
			this.currentHandler = {
				messageCallback: () => {},
				isPolling: false,
				lastMessageId: null,
				url: "",
				headers: {},
				pollInterval: 1000,
				retryCount: 0,
				maxRetries: 3,
				retryDelay: 1000,
				disposed: false,
				send: async (message: WebviewMessage) => {
					console.log("Mock message sent:", message)
					return Promise.resolve()
				},
				onMessage: () => {
					// Mock message handling
				},
			} as RestHandler
		}
	}

	getHandler(): CommunicationHandler | null {
		return this.currentHandler
	}
}
