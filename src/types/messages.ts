export interface WebviewMessage {
	type: string
	payload: any
}

export interface WebSocketMessage {
	type: string
	data: any
}

export interface WebSocketHandler {
	send: (message: WebviewMessage) => void
	close: () => void
}

export interface VSCodeAPI {
	postMessage: (message: any) => void
	setState: (state: any) => void
	getState: () => any
}
