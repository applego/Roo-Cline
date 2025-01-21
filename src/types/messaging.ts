// メッセージの基本型
export interface BaseMessage {
	type: string
	id: string
	timestamp: number
}

// コマンドメッセージ
export interface CommandMessage extends BaseMessage {
	type: "command"
	command: string
	params?: Record<string, any>
}

// 応答メッセージ
export interface ResponseMessage extends BaseMessage {
	type: "response"
	requestId: string
	status: "success" | "error"
	data?: any
	error?: {
		code: string
		message: string
		details?: any
	}
}

// 通知メッセージ
export interface NotificationMessage extends BaseMessage {
	type: "notification"
	category: "info" | "warning" | "error"
	title: string
	message: string
	data?: any
}

// ステータス更新メッセージ
export interface StatusUpdateMessage extends BaseMessage {
	type: "status_update"
	status: {
		isConnected: boolean
		lastSync?: number
		currentOperation?: string
	}
}

// メッセージユニオン型
export type Message = CommandMessage | ResponseMessage | NotificationMessage | StatusUpdateMessage

// メッセージハンドラーの型
export type MessageHandler = (message: Message) => void | Promise<void>

// メッセージフィルターの型
export interface MessageFilter {
	type?: string[]
	id?: string[]
	timestamp?: {
		from?: number
		to?: number
	}
}
