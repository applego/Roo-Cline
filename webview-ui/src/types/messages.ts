export interface ClineMessage {
	role: "user" | "assistant" | "system"
	content: string
	timestamp?: string
}

export interface UserMessage {
	type: "user-message"
	message: string
}

export interface VSCodeMessage {
	command: string
	text?: string
	html?: string
}

export type WebviewMessage = UserMessage | VSCodeMessage
