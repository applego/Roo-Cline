import { WebviewApi, VSCodeSettings } from "../types/vscode"

let vscodeApi: WebviewApi<unknown>

/**
 * VSCode WebviewAPIを取得します
 * APIが利用できない場合はモックを使用します
 */
export function getVSCodeAPI<T = unknown>(): WebviewApi<T> {
	if (typeof acquireVsCodeApi !== "undefined") {
		return acquireVsCodeApi()
	} else {
		// VS Code環境でない場合は、モックを使用
		let mockVscode
		if (typeof window !== "undefined") {
			try {
				mockVscode = require("../__mocks__/vscode").default
			} catch (e) {
				mockVscode = {}
			}
		} else {
			mockVscode = {}
		}
		vscodeApi = mockVscode
	}
	return vscodeApi as WebviewApi<T>
}

/**
 * メッセージを送信します
 */
export function postMessage(type: string, payload?: any): void {
	const api = getVSCodeAPI()
	api.postMessage({ type, payload })
}

/**
 * 状態を取得します
 */
export function getState<T>(): T | undefined {
	const api = getVSCodeAPI<T>()
	return api.getState()
}

/**
 * 状態を更新します
 */
export function setState<T>(state: T): void {
	const api = getVSCodeAPI<T>()
	api.setState(state)
}

/**
 * VS Codeの設定を取得します
 */
export async function getVSCodeSettings(): Promise<VSCodeSettings> {
	return new Promise((resolve) => {
		const api = getVSCodeAPI()
		api.postMessage({ type: "getSettings" })

		const handler = (event: MessageEvent) => {
			if (event.data.type === "settings") {
				window.removeEventListener("message", handler)
				resolve(event.data.payload)
			}
		}

		window.addEventListener("message", handler)
	})
}

// VSCode APIのモックを使用するかどうかを環境に応じて決定
export const vscode = getVSCodeAPI()

// イベントリスナーを簡単に登録できるユーティリティ関数
export function addVSCodeMessageListener<T>(type: string, callback: (payload: T) => void): () => void {
	const handler = (event: MessageEvent) => {
		if (event.data.type === type) {
			callback(event.data.payload)
		}
	}

	window.addEventListener("message", handler)
	return () => window.removeEventListener("message", handler)
}

// テーマ関連のユーティリティ関数
export function subscribeToThemeChanges(callback: (theme: any) => void): () => void {
	return addVSCodeMessageListener("theme-changed", callback)
}
