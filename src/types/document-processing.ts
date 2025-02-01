export interface DocumentProcessingRequest {
	type: "pdf" | "docx"
	buffer: ArrayBuffer
}

export interface DocumentProcessingResponse {
	success: boolean
	text: string
	error?: string
}

export interface DocumentProcessingError {
	code: string
	message: string
	details?: unknown
}

// VS Code Webview Panel型定義
export interface WebviewPanel {
	webview: {
		postMessage(message: any): void
	}
}
