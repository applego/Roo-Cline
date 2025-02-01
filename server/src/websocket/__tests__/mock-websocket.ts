import { WebSocket, WebSocketServer } from "ws"
import { EventEmitter } from "events"

export class MockWebSocket extends EventEmitter {
	public readyState: number
	public send: jest.Mock
	public static readonly OPEN = 1
	public static readonly CLOSED = 3

	constructor() {
		super()
		this.readyState = MockWebSocket.OPEN
		this.send = jest.fn()
	}
}

export class MockWebSocketServer extends EventEmitter {
	public clients: Set<MockWebSocket>
	public close: jest.Mock

	constructor() {
		super()
		this.clients = new Set()
		this.close = jest.fn()
	}

	addClient(client: MockWebSocket) {
		this.clients.add(client)
		this.emit("connection", client)
	}
}

export const mockWebSocket = jest.fn().mockImplementation(() => new MockWebSocket())
mockWebSocket.OPEN = MockWebSocket.OPEN
mockWebSocket.CLOSED = MockWebSocket.CLOSED

export const mockWebSocketServer = jest.fn().mockImplementation(() => new MockWebSocketServer())
