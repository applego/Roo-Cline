import { ChatAdapter } from "../../../core/chat/ChatCore"
import { vscode } from "../../../utils/vscode"
import { ChatMessage } from "../../../core/chat/types"

interface RequestChatMessage {
	content: string
	timestamp: string
}

export class VSCodeChatAdapter implements ChatAdapter {
	private onReceiveMessageCallback: ((message: ChatMessage) => void) | null = null

	async connect(): Promise<void> {
		console.log("VSCodeChatAdapter: connect()")
	}

	async sendMessage(message: RequestChatMessage): Promise<void> {
		vscode.postMessage({
			type: "sendMessage",
			payload: message,
		})
	}

	async disconnect(): Promise<void> {
		console.log("VSCodeChatAdapter: disconnect()")
	}

	onReceiveMessage(callback: (message: ChatMessage) => void): void {
		this.onReceiveMessageCallback = callback

		// VS Codeからのメッセージをリッスン
		window.addEventListener("message", (event) => {
			const message = event.data
			if (message.type === "response") {
				this.onReceiveMessageCallback?.(message.payload)
			}
		})
	}

	isReady(): boolean {
		return true
	}
}
