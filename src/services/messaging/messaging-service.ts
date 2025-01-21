import { v4 as uuidv4 } from "uuid"
import {
	Message,
	MessageHandler,
	MessageFilter,
	CommandMessage,
	ResponseMessage,
	NotificationMessage,
	StatusUpdateMessage,
} from "../../types/messaging"
import { CommunicationHandler } from "../../types"

export class MessagingService {
	private handlers: Map<string, MessageHandler> = new Map()
	private communicationHandler: CommunicationHandler

	constructor(communicationHandler: CommunicationHandler) {
		this.communicationHandler = communicationHandler
		this.setupMessageListener()
	}

	private setupMessageListener(): void {
		this.communicationHandler.onMessage((message: Message) => {
			this.handleMessage(message)
		})
	}

	private async handleMessage(message: Message): Promise<void> {
		for (const handler of this.handlers.values()) {
			try {
				await handler(message)
			} catch (error) {
				console.error("Error in message handler:", error)
			}
		}
	}

	public addHandler(handler: MessageHandler): string {
		const id = uuidv4()
		this.handlers.set(id, handler)
		return id
	}

	public removeHandler(id: string): boolean {
		return this.handlers.delete(id)
	}

	public async sendCommand(command: string, params?: Record<string, any>): Promise<void> {
		const message: CommandMessage = {
			type: "command",
			id: uuidv4(),
			timestamp: Date.now(),
			command,
			params,
		}
		await this.communicationHandler.send(message)
	}

	public async sendResponse(requestId: string, status: "success" | "error", data?: any, error?: any): Promise<void> {
		const message: ResponseMessage = {
			type: "response",
			id: uuidv4(),
			timestamp: Date.now(),
			requestId,
			status,
			data,
			error,
		}
		await this.communicationHandler.send(message)
	}

	public async sendNotification(
		category: "info" | "warning" | "error",
		title: string,
		message: string,
		data?: any,
	): Promise<void> {
		const notificationMessage: NotificationMessage = {
			type: "notification",
			id: uuidv4(),
			timestamp: Date.now(),
			category,
			title,
			message,
			data,
		}
		await this.communicationHandler.send(notificationMessage)
	}

	public async updateStatus(isConnected: boolean, lastSync?: number, currentOperation?: string): Promise<void> {
		const statusMessage: StatusUpdateMessage = {
			type: "status_update",
			id: uuidv4(),
			timestamp: Date.now(),
			status: {
				isConnected,
				lastSync,
				currentOperation,
			},
		}
		await this.communicationHandler.send(statusMessage)
	}

	public filterMessages(messages: Message[], filter: MessageFilter): Message[] {
		return messages.filter((message) => {
			if (filter.type && !filter.type.includes(message.type)) {
				return false
			}
			if (filter.id && !filter.id.includes(message.id)) {
				return false
			}
			if (filter.timestamp) {
				const { from, to } = filter.timestamp
				if (from && message.timestamp < from) {
					return false
				}
				if (to && message.timestamp > to) {
					return false
				}
			}
			return true
		})
	}
}
