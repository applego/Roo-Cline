import * as vscode from "vscode"
import * as mammoth from "mammoth"
import { DocumentProcessingRequest, DocumentProcessingResponse, WebviewPanel } from "../types/document-processing"

export class DocumentHandler {
	private static _instance: DocumentHandler
	private _panel: WebviewPanel | undefined

	private constructor() {}

	public static getInstance(): DocumentHandler {
		if (!DocumentHandler._instance) {
			DocumentHandler._instance = new DocumentHandler()
		}
		return DocumentHandler._instance
	}

	public setPanel(panel: WebviewPanel): void {
		this._panel = panel
	}

	public async handleDocumentProcessing(request: DocumentProcessingRequest): Promise<void> {
		try {
			let response: DocumentProcessingResponse

			if (request.type === "docx") {
				const result = await mammoth.extractRawText({ buffer: Buffer.from(request.buffer) })
				response = {
					success: true,
					text: result.value,
				}
			} else {
				response = {
					success: false,
					text: "",
					error: `Unsupported document type: ${request.type}`,
				}
			}

			this._panel?.webview.postMessage({
				command: "documentProcessed",
				payload: response,
			})
		} catch (error) {
			this._panel?.webview.postMessage({
				command: "documentProcessed",
				payload: {
					success: false,
					text: "",
					error: error instanceof Error ? error.message : "Unknown error occurred",
				},
			})
		}
	}
}
