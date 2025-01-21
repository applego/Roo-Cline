import type { DocumentProcessingError } from "../types/document-processing"

export class DocumentError extends Error {
	public readonly code: string
	public readonly details?: unknown

	constructor(error: DocumentProcessingError) {
		super(error.message)
		this.code = error.code
		this.details = error.details
		this.name = "DocumentError"
	}
}

export function createDocumentError(code: string, message: string, details?: unknown): DocumentError {
	return new DocumentError({ code, message, details })
}

export const ErrorCodes = {
	unsupportedType: "UNSUPPORTED_TYPE",
	processingFailed: "PROCESSING_FAILED",
	apiUnavailable: "API_UNAVAILABLE",
	invalidBuffer: "INVALID_BUFFER",
} as const

export function isDocumentError(error: unknown): error is DocumentError {
	return error instanceof DocumentError
}

export function handleDocumentError(error: unknown): DocumentProcessingError {
	if (isDocumentError(error)) {
		return {
			code: error.code,
			message: error.message,
			details: error.details,
		}
	}

	if (error instanceof Error) {
		return {
			code: ErrorCodes.processingFailed,
			message: error.message,
			details: error.stack,
		}
	}

	return {
		code: ErrorCodes.processingFailed,
		message: "An unknown error occurred",
		details: error,
	}
}
