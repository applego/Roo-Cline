import { WebSocketHandler } from "./websocket-handler"
import { RestHandler } from "./rest-handler"
import { CommunicationConfig, CommunicationHandler } from "./types"

export class CommunicationFactory {
	private static _instance: CommunicationFactory | null = null
	private _currentHandler: CommunicationHandler | null = null
	private _config: CommunicationConfig | null = null

	private constructor() {}

	public static getInstance(): CommunicationFactory {
		if (!CommunicationFactory._instance) {
			CommunicationFactory._instance = new CommunicationFactory()
		}
		return CommunicationFactory._instance
	}

	public configure(config: CommunicationConfig): void {
		this._config = config
		this._initializeHandler()
	}

	public getHandler<T extends CommunicationHandler>(): T {
		if (!this._currentHandler) {
			if (!this._config) {
				throw new Error("Communication not configured")
			}
			this._initializeHandler()
		}
		return this._currentHandler as T
	}

	private _initializeHandler(): void {
		if (!this._config) {
			throw new Error("Configuration is required")
		}

		switch (this._config.mode) {
			case "websocket":
				if (!this._config.wsUrl) {
					throw new Error("WebSocket URL is required")
				}
				this._currentHandler = new WebSocketHandler(this._config.wsUrl)
				break

			case "rest":
				if (!this._config.restUrl) {
					throw new Error("REST API URL is required")
				}
				this._currentHandler = new RestHandler(this._config.restUrl, this._config.pollingInterval)
				break

			case "vscode":
				this._currentHandler = this._createVSCodeHandler()
				break

			default:
				throw new Error(`Unsupported communication mode: ${this._config.mode}`)
		}
	}

	private _createVSCodeHandler(): CommunicationHandler {
		if (typeof acquireVsCodeApi === "function") {
			const vscode = acquireVsCodeApi()
			return {
				send: async (message: any) => {
					vscode.postMessage(message)
				},
				onMessage: (callback: (message: any) => void) => {
					window.addEventListener("message", (event) => {
						callback(event.data)
					})
				},
			}
		} else {
			console.warn("VSCode API not available")
			return {
				send: async (message: any) => {
					console.log("Mock message sent:", message)
				},
				onMessage: () => {
					console.log("Mock onMessage registered")
				},
			}
		}
	}
}
