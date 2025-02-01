import { WebviewMessage, MessageCallback, VSCodeHandler } from "./types"

export class StandaloneHandler implements VSCodeHandler {
	private state: any = null
	private readonly storage: Storage
	private readonly storageKey = "roo-cline-state"

	constructor(
		private ws: WebSocket,
		storage: Storage = localStorage,
	) {
		this.storage = storage
		this.loadState()
	}

	private loadState(): void {
		const savedState = this.storage.getItem(this.storageKey)
		if (savedState) {
			try {
				this.state = JSON.parse(savedState)
			} catch (error) {
				console.error("Error loading state:", error)
				this.state = null
			}
		}
	}

	private saveState(): void {
		try {
			this.storage.setItem(this.storageKey, JSON.stringify(this.state))
		} catch (error) {
			console.error("Error saving state:", error)
		}
	}

	async send(message: WebviewMessage): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.ws.send(JSON.stringify(message))
				resolve()
			} catch (error) {
				reject(error)
			}
		})
	}

	onMessage(callback: MessageCallback): void {
		this.ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data)
				callback(message)
			} catch (error) {
				console.error("Error parsing message:", error)
			}
		}
	}

	getState(): any {
		return this.state
	}

	setState(state: any): void {
		this.state = state
		this.saveState()
	}
}
