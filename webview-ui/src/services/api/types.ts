import { StandaloneMessage, EnhancedWebviewMessage } from "../../types/messages"

export interface WebviewMessage {
	type: string
	text?: string
	[key: string]: any
}

// MessageCallbackの型をEnhancedWebviewMessageに更新
export type MessageCallback = (message: EnhancedWebviewMessage) => void

export interface CommunicationHandler {
	send(message: StandaloneMessage): Promise<void>
	onMessage(callback: MessageCallback): void
}

export interface VSCodeHandler extends CommunicationHandler {
	getState(): any
	setState(state: any): void
}

export type CommunicationMode = "websocket" | "rest" | "vscode" | "standalone"

export interface CommunicationOptions {
	wsUrl?: string
	restUrl?: string
	pollingInterval?: number
}

export interface CommunicationConfig {
	mode: CommunicationMode
	wsUrl?: string
	restUrl?: string
	pollingInterval?: number
}

export function createCommunicationConfig(config: {
	mode: CommunicationMode
	wsUrl?: string
	restUrl?: string
	pollingInterval?: number
}): CommunicationConfig {
	return {
		mode: config.mode,
		wsUrl: config.wsUrl,
		restUrl: config.restUrl,
		pollingInterval: config.pollingInterval || 1000,
	}
}
