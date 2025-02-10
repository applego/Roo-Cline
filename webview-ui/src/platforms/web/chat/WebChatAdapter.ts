import { ChatAdapter } from "../../../core/chat/ChatCore"
import { ChatMessage } from "../../../core/chat/types"
import { webSocketClient } from "../../../services/websocket/WebSocketClient"
import { isStandaloneWeb } from "../../../utils/environment"

interface RequestChatMessage {
	content: string
	timestamp: string
}

export class WebChatAdapter implements ChatAdapter {
	private readonly url: string = ""
	private readonly token: string = ""
	private onReceiveMessageCallback: ((message: ChatMessage) => void) | null = null

	async connect(): Promise<void> {
		if (!isStandaloneWeb()) {
			console.warn("WebChatAdapter: connect() - not in standalone web mode, skipping connection")
			return
		}

		webSocketClient.connect()

		webSocketClient.on("message", (message: any) => {
			if (this.onReceiveMessageCallback) {
				this.onReceiveMessageCallback(message)
			}
		})
	}

	async sendMessage(message: RequestChatMessage): Promise<void> {
		if (!isStandaloneWeb()) {
			console.warn("WebChatAdapter: sendMessage() - not in standalone web mode, skipping message")
			return
		}

		webSocketClient.send("sendMessage", message)
	}

	async disconnect(): Promise<void> {
		if (!isStandaloneWeb()) {
			console.warn("WebChatAdapter: disconnect() - not in standalone web mode, skipping disconnection")
			return
		}

		webSocketClient.close()
	}

	onReceiveMessage(callback: (message: ChatMessage) => void): void {
		this.onReceiveMessageCallback = callback
	}

	// 他の必要なメソッドを実装
	isReady(): boolean {
		return webSocketClient.isConnected()
	}
}

export const createWebChatAdapter = (): WebChatAdapter => {
	return new WebChatAdapter()
}
