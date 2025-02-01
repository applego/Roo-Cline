import { WebviewMessage } from "../../types/messages"

export interface CommunicationHandler {
	send: (message: WebviewMessage) => Promise<void>
	onMessage: () => void
	messageCallback?: () => void
}

export interface RestHandler extends CommunicationHandler {
	messageCallback: () => void
	isPolling: boolean
	lastMessageId: string | null
	url: string
	headers: Record<string, string>
	pollInterval: number
	retryCount: number
	maxRetries: number
	retryDelay: number
	disposed: boolean
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
