export interface ChatAdapter {
	connect(): Promise<void>
	sendMessage(message: any): Promise<void>
	disconnect(): Promise<void>
	onReceiveMessage(callback: (message: any) => void): void
	isReady(): boolean
}
