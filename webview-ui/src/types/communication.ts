export interface CommunicationHandler {
	send: (message: any) => Promise<void>
	onMessage: (callback: (msg: any) => void) => void
	messageCallback?: (msg: any) => void
	dispose?: () => void
}

export interface RestHandler extends CommunicationHandler {
	messageCallback: (msg: any) => void
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
