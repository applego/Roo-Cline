export interface CommunicationHandler {
	send: (message: any) => Promise<void>
	onMessage: (callback: (message: any) => void) => void
	_messageCallback: (message: any) => void
	_isPolling: boolean
	_lastMessageId: string
	_url: string
	_ws: WebSocket | null
	_reconnectAttempts: number
	_maxReconnectAttempts: number
	_reconnectDelay: number
	_isConnected: boolean
	_pendingMessages: any[]
	connect: () => Promise<void>
	disconnect: () => void
}

declare global {
	interface Window {
		acquireVsCodeApi: () => {
			postMessage: (message: any) => void
			getState: () => any
			setState: (state: any) => void
		}
	}
}
