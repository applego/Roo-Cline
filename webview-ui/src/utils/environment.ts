/**
 * 現在の実行環境がVS Code webviewかどうかを判定します
 */
export function isVSCodeEnvironment(): boolean {
	try {
		// acquireVsCodeApiの存在チェック
		return typeof acquireVsCodeApi === "function"
	} catch (error) {
		return false
	}
}

/**
 * 現在の実行環境が開発モードかどうかを判定します
 */
export function isDevelopment(): boolean {
	return import.meta.env.DEV === true
}

/**
 * 現在の実行環境が本番モードかどうかを判定します
 */
export function isProduction(): boolean {
	return import.meta.env.PROD === true
}

/**
 * スタンドアロンWebアプリケーションとして実行されているかどうかを判定します
 */
export function isStandaloneWeb(): boolean {
	return !isVSCodeEnvironment()
}

/**
 * 現在の実行環境に関する情報を取得します
 */
export function getEnvironmentInfo() {
	return {
		isVSCode: isVSCodeEnvironment(),
		isDev: isDevelopment(),
		isProd: isProduction(),
		isStandalone: isStandaloneWeb(),
		nodeEnv: import.meta.env.NODE_ENV,
	}
}
