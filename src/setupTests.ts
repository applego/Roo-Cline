import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

// グローバルなモックの設定
;(window as any).WebSocket = class MockWebSocket {
	constructor(url: string) {
		// WebSocketのモック実装
	}

	send(data: any) {
		// データ送信のモック
	}

	close() {
		// 接続終了のモック
	}
}

// VSCode APIのモック
;(window as any).acquireVsCodeApi = () => ({
	postMessage: jest.fn(),
	getState: jest.fn(),
	setState: jest.fn(),
})
