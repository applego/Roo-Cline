export interface WebSocketMessage {
	type: string
	payload?: any
}

export interface WebSocketServer {
	onConnection(handler: (connection: WebSocketConnection) => void): void
	onMessage(handler: MessageHandler): void
	broadcast(message: WebSocketMessage): void
	send(connectionId: string, message: WebSocketMessage): void
	close(): void
}

export interface WebSocketConnection {
	id: string
	send(message: WebSocketMessage): void
}

export type MessageHandler = (message: WebSocketMessage, connection: WebSocketConnection) => Promise<void>

export interface FileOperation {
	type: "read" | "write" | "delete" | "list" | "search"
	path: string
	content?: string
	pattern?: string
}

export interface FileOperationResult {
	success: boolean
	data?: any
	error?: string
}

export class FileNotFoundError extends Error {
	constructor(path: string) {
		super(`File not found: ${path}`)
		this.name = "FileNotFoundError"
	}
}

export class AccessDeniedError extends Error {
	constructor(path: string) {
		super(`Access denied: ${path}`)
		this.name = "AccessDeniedError"
	}
}

export class InvalidPathError extends Error {
	constructor(path: string) {
		super(`Invalid path: ${path}`)
		this.name = "InvalidPathError"
	}
}

export class FileSizeLimitError extends Error {
	constructor(path: string, fileSize: number, limit: number) {
		super(`File size ${fileSize} exceeds limit of ${limit} bytes for file: ${path}`)
		this.name = "FileSizeLimitError"
	}
}
