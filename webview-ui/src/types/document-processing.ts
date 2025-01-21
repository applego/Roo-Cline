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
