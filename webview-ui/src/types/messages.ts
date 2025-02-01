import { ExtensionMessage, ExtensionState } from "../../../src/shared/ExtensionMessage"
import { WebviewMessage } from "../services/api/types"

// ExtensionMessageの型を拡張してスタンドアロンモード用のメッセージタイプを追加
export type StandaloneMessageType = ExtensionMessage["type"] | "upsertApiConfiguration"

// スタンドアロンモード用のメッセージ型
export interface StandaloneMessage extends Omit<ExtensionMessage, "type"> {
	type: StandaloneMessageType
	apiConfiguration?: any
	state?: ExtensionState
}

// WebSocketハンドラーで使用するメッセージ型
export interface EnhancedWebviewMessage extends Omit<WebviewMessage, "type"> {
	type: StandaloneMessageType
	state?: ExtensionState
	apiConfiguration?: any
}

// WebviewMessage型をEnhancedWebviewMessageに変換する
export function convertToEnhancedWebviewMessage(message: WebviewMessage): EnhancedWebviewMessage {
	return {
		...message,
		type: message.type as StandaloneMessageType,
	}
}

// StandaloneMessage型をWebviewMessage型に変換する
export function convertToWebviewMessage(message: StandaloneMessage): WebviewMessage {
	const { type, text, state, apiConfiguration, ...rest } = message
	return {
		type,
		text,
		state,
		apiConfiguration,
		...rest,
	}
}
