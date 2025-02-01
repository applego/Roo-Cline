import { WebSocket } from "ws"

export interface WebSocketServer {
	broadcast(message: WebSocketMessage): void
	send(connectionId: string, message: WebSocketMessage): void
	onConnection(handler: (connection: WebSocketConnection) => void): void
	onMessage(handler: MessageHandler): void
	close(): void
}

export interface WebSocketConnection {
	id: string
	send(message: WebSocketMessage): void
}

export interface WebSocketMessage {
	type: string
	payload: any
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

// ファイル操作のエラー型
export class FileOperationError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message)
		this.name = "FileOperationError"
	}
}

export class FileNotFoundError extends FileOperationError {
	constructor(path: string) {
		super(`File not found: ${path}`, "FILE_NOT_FOUND")
	}
}

export class AccessDeniedError extends FileOperationError {
	constructor(path: string) {
		super(`Access denied: ${path}`, "ACCESS_DENIED")
	}
}

export class InvalidPathError extends FileOperationError {
	constructor(path: string) {
		super(`Invalid path: ${path}`, "INVALID_PATH")
	}
}

export class FileSizeLimitError extends FileOperationError {
	constructor(path: string, size: number, limit: number) {
		super(`File size exceeds limit: ${path} (${size} > ${limit} bytes)`, "FILE_SIZE_LIMIT")
	}
}
