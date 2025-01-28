export interface WebSocketMessage {
	type: string
	payload?: any
}

export interface ServerToClientEvents {
	message: (message: WebSocketMessage) => void
	error: (error: Error) => void
}

export interface ClientToServerEvents {
	message: (message: WebSocketMessage) => void
}

export interface WebSocketConnection {
	id: string
	send: (message: WebSocketMessage) => void
}

export type MessageHandler = (message: WebSocketMessage, connection: WebSocketConnection) => Promise<void>

export interface WebSocketServer {
	broadcast: (message: WebSocketMessage) => void
	send: (connectionId: string, message: WebSocketMessage) => void
	onConnection: (handler: (connection: WebSocketConnection) => void) => void
	onMessage: (handler: MessageHandler) => void
	close: () => void
}
