/// <reference types="@jest/globals" />

import { describe, expect, it, jest, beforeEach } from "@jest/globals"
import { MessagingService } from "../messaging-service"
import { CommunicationHandler } from "../../../types"
import { Message, MessageHandler } from "../../../types/messaging"

describe("MessagingService", () => {
	let messagingService: MessagingService
	let mockCommunicationHandler: jest.Mocked<CommunicationHandler>
	let mockMessage: Message

	beforeEach(() => {
		mockCommunicationHandler = {
			send: jest.fn(),
			onMessage: jest.fn(),
			_messageCallback: jest.fn(),
			_isPolling: false,
			_lastMessageId: "",
			_url: "",
			_ws: null,
			_reconnectAttempts: 0,
			_maxReconnectAttempts: 5,
			_reconnectDelay: 1000,
			_isConnected: false,
			_pendingMessages: [],
			connect: jest.fn(),
			disconnect: jest.fn(),
		}

		mockMessage = {
			type: "command",
			id: "test-id",
			timestamp: Date.now(),
			command: "test-command",
		}

		messagingService = new MessagingService(mockCommunicationHandler)
	})

	describe("Message Handling", () => {
		it("should add and remove message handlers", () => {
			const handler = jest.fn()
			const handlerId = messagingService.addHandler(handler as unknown as MessageHandler)

			expect(handler).not.toHaveBeenCalled()
			expect(typeof handlerId).toBe("string")

			const removed = messagingService.removeHandler(handlerId)
			expect(removed).toBe(true)
		})

		it("should call all registered handlers when receiving a message", async () => {
			const handler1 = jest.fn()
			const handler2 = jest.fn()

			messagingService.addHandler(handler1 as unknown as MessageHandler)
			messagingService.addHandler(handler2 as unknown as MessageHandler)

			// Simulate receiving a message
			const onMessageCallback = mockCommunicationHandler.onMessage.mock.calls[0][0]
			await onMessageCallback(mockMessage)

			expect(handler1).toHaveBeenCalledWith(mockMessage)
			expect(handler2).toHaveBeenCalledWith(mockMessage)
		})
	})

	describe("Message Sending", () => {
		it("should send command messages", async () => {
			await messagingService.sendCommand("test-command", { param: "value" })

			expect(mockCommunicationHandler.send).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "command",
					command: "test-command",
					params: { param: "value" },
				}),
			)
		})

		it("should send response messages", async () => {
			await messagingService.sendResponse("request-id", "success", { data: "test" })

			expect(mockCommunicationHandler.send).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "response",
					requestId: "request-id",
					status: "success",
					data: { data: "test" },
				}),
			)
		})

		it("should send notification messages", async () => {
			await messagingService.sendNotification("info", "Test Title", "Test Message")

			expect(mockCommunicationHandler.send).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "notification",
					category: "info",
					title: "Test Title",
					message: "Test Message",
				}),
			)
		})

		it("should send status update messages", async () => {
			await messagingService.updateStatus(true, 123456789, "test-operation")

			expect(mockCommunicationHandler.send).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "status_update",
					status: {
						isConnected: true,
						lastSync: 123456789,
						currentOperation: "test-operation",
					},
				}),
			)
		})
	})

	describe("Message Filtering", () => {
		it("should filter messages by type", () => {
			const messages: Message[] = [
				{ type: "command", id: "1", timestamp: 1, command: "test" },
				{ type: "response", id: "2", timestamp: 2, requestId: "1", status: "success" },
			]

			const filtered = messagingService.filterMessages(messages, { type: ["command"] })
			expect(filtered).toHaveLength(1)
			expect(filtered[0].type).toBe("command")
		})

		it("should filter messages by timestamp range", () => {
			const messages: Message[] = [
				{ type: "command", id: "1", timestamp: 100, command: "test" },
				{ type: "command", id: "2", timestamp: 200, command: "test" },
				{ type: "command", id: "3", timestamp: 300, command: "test" },
			]

			const filtered = messagingService.filterMessages(messages, {
				timestamp: { from: 150, to: 250 },
			})
			expect(filtered).toHaveLength(1)
			expect(filtered[0].id).toBe("2")
		})
	})
})
