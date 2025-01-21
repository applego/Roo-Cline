import type { DocumentProcessingRequest, DocumentProcessingResponse } from "../types/document-processing"
import { extractTextFromPdf } from "../utils/document-utils"

export class DocumentService {
	private static _instance: DocumentService
	private _vscode: any

	private constructor() {
		// VS Code APIの取得
		this._vscode = typeof acquireVsCodeApi !== "undefined" ? acquireVsCodeApi() : null
	}

	public static getInstance(): DocumentService {
		if (!DocumentService._instance) {
			DocumentService._instance = new DocumentService()
		}
		return DocumentService._instance
	}

	public async processDocument(request: DocumentProcessingRequest): Promise<DocumentProcessingResponse> {
		try {
			if (request.type === "pdf") {
				// PDFはブラウザ側で処理
				const text = await extractTextFromPdf(request.buffer)
				return { success: true, text }
			} else if (request.type === "docx") {
				// DOCXはバックエンド側で処理
				if (!this._vscode) {
					throw new Error("VS Code API not available")
				}

				// バックエンドにリクエストを送信
				this._vscode.postMessage({
					command: "processDocument",
					payload: {
						type: request.type,
						buffer: request.buffer,
					},
				})

				// レスポンスを待機
				return new Promise((resolve) => {
					window.addEventListener("message", (event) => {
						const message = event.data
						if (message.command === "documentProcessed") {
							resolve(message.payload)
						}
					})
				})
			}

			throw new Error(`Unsupported document type: ${request.type}`)
		} catch (error) {
			console.error("Document processing failed:", error)
			return {
				success: false,
				text: "",
				error: error instanceof Error ? error.message : "Unknown error occurred",
			}
		}
	}
}
