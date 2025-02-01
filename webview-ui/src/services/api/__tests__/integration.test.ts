import { WebSocketHandler } from "../websocket-handler"
import { RestHandler } from "../rest-handler"
import { WebviewMessage } from "../types"

describe("WebUI-Server Integration", () => {
	let wsHandler: WebSocketHandler
	let restHandler: RestHandler
	const wsUrl = "ws://localhost:3002"
	const restUrl = "http://localhost:3002"

	beforeAll(() => {
		// サーバーが起動していることを前提とします
		wsHandler = new WebSocketHandler(wsUrl)
		restHandler = new RestHandler(restUrl)
	})

	afterAll(() => {
		wsHandler.close()
		restHandler.stopPolling()
	})

	describe("WebSocket通信", () => {
		it("メッセージを送信して受信できる", async () => {
			const testMessage: WebviewMessage = {
				type: "test",
				text: "WebSocket test message",
			}

			const messagePromise = new Promise<WebviewMessage>((resolve) => {
				wsHandler.onMessage((message) => {
					if (message.type === "test") {
						resolve(message)
					}
				})
			})

			await wsHandler.send(testMessage)
			const receivedMessage = await messagePromise
			expect(receivedMessage.text).toBe(testMessage.text)
		})

		it("接続時に初期メッセージを受信できる", async () => {
			const newHandler = new WebSocketHandler(wsUrl)

			const initMessagePromise = new Promise<WebviewMessage>((resolve) => {
				newHandler.onMessage((message) => {
					if (message.type === "init") {
						resolve(message)
					}
				})
			})

			const message = await initMessagePromise
			expect(Array.isArray(message.messages)).toBe(true)
			expect(typeof message.lastId).toBe("number")
			newHandler.close()
		})
	})

	describe("REST API通信", () => {
		it("メッセージを送信して取得できる", async () => {
			const testMessage: WebviewMessage = {
				type: "test",
				text: "REST API test message",
			}

			// メッセージを送信
			await restHandler.send(testMessage)

			// メッセージ受信を待機
			const messagePromise = new Promise<WebviewMessage>((resolve) => {
				restHandler.onMessage((message) => {
					if (message.type === "test" && message.text === testMessage.text) {
						resolve(message)
					}
				})
			})

			const receivedMessage = await Promise.race([
				messagePromise,
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error("Timeout waiting for message")), 2000),
				),
			])

			expect(receivedMessage.text).toBe(testMessage.text)
		})

		it("since パラメータで新しいメッセージのみ取得できる", async () => {
			const testMessage1: WebviewMessage = {
				type: "test",
				text: "Message 1",
			}

			const testMessage2: WebviewMessage = {
				type: "test",
				text: "Message 2",
			}

			// メッセージを順番に送信
			await restHandler.send(testMessage1)
			await new Promise((resolve) => setTimeout(resolve, 100))
			await restHandler.send(testMessage2)

			// メッセージ受信を待機
			const messages: WebviewMessage[] = []
			const messagePromise = new Promise<WebviewMessage[]>((resolve) => {
				const handler = (message: WebviewMessage) => {
					messages.push(message)
					if (messages.length >= 2) {
						resolve(messages)
					}
				}
				restHandler.onMessage(handler)
			})

			const receivedMessages = await Promise.race([
				messagePromise,
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error("Timeout waiting for messages")), 2000),
				),
			])

			expect(receivedMessages.length).toBe(2)
			expect(receivedMessages[1].text).toBe("Message 2")
		})
	})
})
