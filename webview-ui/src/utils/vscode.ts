import { CommunicationFactory } from "../services/api/communication-factory"
import { CommunicationConfig, VSCodeHandler } from "../services/api/types"

export function setupVsCodeComms(config: Partial<CommunicationConfig> = {}): void {
	const factory = CommunicationFactory.getInstance()

	const defaultConfig: CommunicationConfig = {
		mode: isVsCodeEnvironment() ? "vscode" : "standalone",
		wsUrl: process.env.REACT_APP_WS_URL || "ws://localhost:3000/ws",
		pollingInterval: 1000,
	}

	factory.configure({ ...defaultConfig, ...config })
}

export function isVsCodeEnvironment(): boolean {
	return typeof acquireVsCodeApi === "function"
}

// VSCodeが利用可能な場合のみAPIを初期化
let vscodeApi: any = null
if (isVsCodeEnvironment()) {
	try {
		vscodeApi = acquireVsCodeApi()
	} catch (error) {
		console.warn("Failed to acquire VS Code API:", error)
	}
}

// vscodeNamespaceは既存のアプリケーションとの後方互換性のために維持
// 新しいコードではCommunicationFactoryを使用することを推奨
export const vscode = {
	postMessage: (message: any) => {
		if (vscodeApi) {
			vscodeApi.postMessage(message)
		} else {
			// スタンドアロンモードの場合、CommunicationFactoryを使用
			const handler = CommunicationFactory.getInstance().getHandler<VSCodeHandler>()
			handler.send(message).catch((error) => {
				console.error("Error sending message:", error)
			})
		}
	},
	getState: () => {
		if (vscodeApi) {
			return vscodeApi.getState()
		}
		// スタンドアロンモードの場合、CommunicationFactoryを使用
		const handler = CommunicationFactory.getInstance().getHandler<VSCodeHandler>()
		return handler.getState()
	},
	setState: (state: any) => {
		if (vscodeApi) {
			vscodeApi.setState(state)
		} else {
			// スタンドアロンモードの場合、CommunicationFactoryを使用
			const handler = CommunicationFactory.getInstance().getHandler<VSCodeHandler>()
			handler.setState(state)
		}
	},
}
