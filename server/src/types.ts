// WebUI とサーバー間で共有する型定義
export interface WebviewMessage {
	type: string
	text?: string
	id?: number
	[key: string]: any
}

// WebSocket用のレスポンス型
export interface WebSocketResponse {
	success: boolean
	error?: string
	data?: any
}

// REST API用のレスポンス型
export interface RestResponse {
	success: boolean
	error?: string
	data?: WebviewMessage[]
	lastId?: number
}

// サーバーの設定型
export interface ServerConfig {
	port: number
	corsOrigins: string[]
	maxReconnectAttempts: number
	reconnectDelay: number
}
