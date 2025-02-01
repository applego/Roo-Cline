import * as pdfjsLib from "pdfjs-dist"
import { createDocumentError, ErrorCodes } from "./error-utils"

// PDFの処理
export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
	try {
		const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
		let text = ""

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i)
			const content = await page.getTextContent()
			const pageText = content.items.map((item: any) => item.str).join(" ")
			text += pageText + "\n"
		}

		return text
	} catch (error) {
		throw createDocumentError(ErrorCodes.processingFailed, "Failed to process PDF document", error)
	}
}

// DOCXの処理
export async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
	throw createDocumentError(ErrorCodes.unsupportedType, "DOCX processing is not supported in browser environment")
}

// バイナリファイルの判定
export function isBinaryContent(buffer: ArrayBuffer): boolean {
	try {
		const uint8Array = new Uint8Array(buffer)
		const BINARY_THRESHOLD = 0.3
		let nonTextCount = 0

		for (let i = 0; i < Math.min(uint8Array.length, 512); i++) {
			const byte = uint8Array[i]
			if ((byte < 32 || byte > 126) && byte !== 9 && byte !== 10 && byte !== 13) {
				nonTextCount++
			}
		}

		return nonTextCount / Math.min(uint8Array.length, 512) > BINARY_THRESHOLD
	} catch (error) {
		throw createDocumentError(ErrorCodes.invalidBuffer, "Failed to analyze buffer content", error)
	}
}
