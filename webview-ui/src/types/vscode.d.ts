export interface WebviewApi<T> {
	/**
	 * メッセージを投稿します
	 */
	postMessage(message: any): void

	/**
	 * 状態を取得します
	 */
	getState(): T | undefined

	/**
	 * 状態を設定します
	 */
	setState(newState: T): void
}

export interface VSCodeSettings {
	theme: "light" | "dark" | "high-contrast"
	fontSize: string
	fontFamily: string
	[key: string]: any // その他の設定
}

// グローバル変数としてVSCode APIを宣言
declare global {
	function acquireVsCodeApi(): WebviewApi<unknown>
}
