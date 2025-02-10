import { WebviewApi } from "../types/vscode"
import EventEmitter from "../utils/EventEmitter"

class MockVSCodeAPI implements WebviewApi<unknown> {
	private state: unknown
	private eventEmitter: EventEmitter

	constructor() {
		this.state = {}
		this.eventEmitter = new EventEmitter()
	}

	postMessage(message: any): void {
		console.log("[Mock VSCode] Message posted:", message)

		// メッセージタイプに応じて適切なモック応答を返す
		switch (message.type) {
			case "getSettings":
				this.mockGetSettings()
				break
			case "sendMessage":
				this.mockChatResponse(message)
				break
			default:
				console.log(`[Mock VSCode] Unhandled message type: ${message.type}`)
		}
	}

	getState(): unknown {
		return this.state
	}

	setState(newState: unknown): void {
		this.state = newState
		// LocalStorageにも保存
		try {
			localStorage.setItem("vscode-webview-state", JSON.stringify(newState))
		} catch (error) {
			console.warn("[Mock VSCode] Failed to save state to localStorage:", error)
		}
	}

	private mockGetSettings(): void {
		// デフォルトの設定をモック
		const mockSettings = {
			theme: "dark",
			fontSize: "14px",
			fontFamily: "monospace",
			// 他の設定も必要に応じて追加
		}

		// メッセージイベントをディスパッチ
		window.dispatchEvent(
			new MessageEvent("message", {
				data: {
					type: "settings",
					payload: mockSettings,
				},
			}),
		)
	}

	private mockChatResponse(message: any): void {
		// チャットメッセージへのモック応答
		setTimeout(() => {
			window.dispatchEvent(
				new MessageEvent("message", {
					data: {
						type: "response",
						payload: {
							content: `Mock response to: ${message.payload.content}`,
							timestamp: new Date().toISOString(),
						},
					},
				}),
			)
		}, 1000) // 1秒の遅延を追加してより現実的な動作をシミュレート
	}
}

// シングルトンインスタンスを作成
const mockVSCodeAPI = new MockVSCodeAPI()

export default mockVSCodeAPI
