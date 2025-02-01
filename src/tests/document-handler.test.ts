import { DocumentHandler } from "../handlers/document-handler"
import { WebviewPanel } from "../types/document-processing"

describe("DocumentHandler", () => {
	let handler: DocumentHandler
	let mockPanel: WebviewPanel

	beforeEach(() => {
		handler = DocumentHandler.getInstance()
		mockPanel = {
			webview: {
				postMessage: jest.fn(),
			},
		}
		handler.setPanel(mockPanel)
	})

	describe("handleDocumentProcessing", () => {
		it("should process DOCX documents successfully", async () => {
			const buffer = Buffer.from("test content")
			await handler.handleDocumentProcessing({
				type: "docx",
				buffer: buffer.buffer,
			})

			expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
				command: "documentProcessed",
				payload: expect.objectContaining({
					success: true,
					text: expect.any(String),
				}),
			})
		})

		it("should handle unsupported document types", async () => {
			const buffer = Buffer.from("test content")
			await handler.handleDocumentProcessing({
				type: "pdf",
				buffer: buffer.buffer,
			})

			expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
				command: "documentProcessed",
				payload: expect.objectContaining({
					success: false,
					error: expect.stringContaining("Unsupported document type"),
				}),
			})
		})

		it("should handle processing errors", async () => {
			const buffer = Buffer.from("invalid content")
			await handler.handleDocumentProcessing({
				type: "docx",
				buffer: buffer.buffer,
			})

			expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
				command: "documentProcessed",
				payload: expect.objectContaining({
					success: false,
					error: expect.any(String),
				}),
			})
		})
	})
})
