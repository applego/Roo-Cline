// Node.js専用モジュールのモック
export const mammoth = {
	extractRawText: async () => ({ value: "", messages: [] }),
	convertToHtml: async () => ({ value: "", messages: [] }),
}

export const pdf = {
	default: async () => ({ text: "", info: {}, metadata: [], version: "" }),
}

export const isBinaryFile = {
	isBinaryFile: async () => false,
}

export const fs = {
	readFile: async () => new Uint8Array(),
	writeFile: async () => {},
	promises: {
		readFile: async () => new Uint8Array(),
		writeFile: async () => {},
	},
}
