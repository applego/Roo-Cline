import { EventEmitter } from "events"
import { WebSocket, WebSocketServer } from "ws"

export class MockWebSocket extends EventEmitter {
	static OPEN = WebSocket.OPEN
	static CLOSED = WebSocket.CLOSED

	readyState: number
	send: jest.Mock

	constructor() {
		super()
		this.readyState = MockWebSocket.OPEN
		this.send = jest.fn()
	}
}

export class MockWebSocketServer extends EventEmitter {
	clients: Set<MockWebSocket>
	on: jest.Mock
	close: jest.Mock

	constructor() {
		super()
		this.clients = new Set()
		this.on = jest.fn()
		this.close = jest.fn()
	}

	addClient(client: MockWebSocket) {
		this.clients.add(client)
		this.emit("connection", client)
	}
}

export const mockWebSocket = jest.fn().mockImplementation(() => new MockWebSocket())
export const mockWebSocketServer = jest.fn().mockImplementation(() => new MockWebSocketServer())
