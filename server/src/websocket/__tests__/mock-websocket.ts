import { Mock } from "jest-mock"

class MockWebSocket {
	static readonly CONNECTING = 0
	static readonly OPEN = 1
	static readonly CLOSING = 2
	static readonly CLOSED = 3

	readyState: number = MockWebSocket.CLOSED
	onopen: (() => void) | null = null
	onmessage: ((event: { data: any }) => void) | null = null
	onclose: (() => void) | null = null
	onerror: (() => void) | null = null

	constructor(public url: string) {}

	send(data: any) {}
	close() {}
}

const mockWebSocket: any = MockWebSocket
mockWebSocket.OPEN = MockWebSocket.OPEN
mockWebSocket.CLOSED = MockWebSocket.CLOSED

export default mockWebSocket
