import { EventEmitter } from "../../utils/EventEmitter"

export interface Message {
	id: string
	content: string
	timestamp: number
	sender: "user" | "assistant"
	type?: string
}

export type ChatMessage = Message

export interface ChatHistory {
	messages: ChatMessage[]
}

export interface ChatState {
	messages: Message[]
	isTyping: boolean
}

export interface ChatOptions {
	initialHistory?: ChatHistory
	url?: string
	token?: string
	timeout?: number
	reconnectAttempts?: number
	reconnectInterval?: number
	debug?: boolean
}

export enum ChatErrorCodes {
	CONNECTION_ERROR = "CONNECTION_ERROR",
	MESSAGE_SEND_ERROR = "MESSAGE_SEND_ERROR",
	INVALID_STATE = "INVALID_STATE",
	NOT_INITIALIZED = "NOT_INITIALIZED",
	ALREADY_INITIALIZED = "ALREADY_INITIALIZED",
	INITIALIZATION_FAILED = "INITIALIZATION_FAILED",
	MESSAGE_SEND_FAILED = "MESSAGE_SEND_FAILED",
	RECEIVE_ERROR = "RECEIVE_ERROR",
	SEND_ERROR = "SEND_ERROR",
}

export class ChatError extends Error {
	constructor(
		public code: ChatErrorCodes,
		message: string,
		public details?: any,
	) {
		super(message)
		this.name = "ChatError"
	}
}

export enum ChatEvents {
	MESSAGE_RECEIVED = "message_received",
	TYPING_START = "typing_start",
	TYPING_END = "typing_end",
	STATE_CHANGED = "state_changed",
	ERROR = "error",
	CONNECT = "connect",
	DISCONNECT = "disconnect",
}

export interface ChatImplementation {
	sendMessage(content: string): Promise<void>
	getHistory(): ChatHistory
	clearHistory(): void
	initialize(): Promise<void>
	dispose(): void
}

export interface ChatAdapter extends EventEmitter {
	state: ChatState
	setState(newState: Partial<ChatState>): void
	getState(): ChatState
	sendMessage(content: string): Promise<void>
	getHistory(): ChatHistory
	clearHistory(): void
	initialize(): Promise<void>
	dispose(): void
	on(event: ChatEvents | string, handler: (...args: any[]) => void): void
	off(event: ChatEvents | string, handler: (...args: any[]) => void): void
	emit(event: ChatEvents | string, ...args: any[]): void
}
