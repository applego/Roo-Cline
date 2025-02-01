// テストグローバル設定
beforeAll(() => {
	// タイムアウトを設定
	jest.setTimeout(10000)
})

beforeEach(() => {
	// ファイルシステムのモックをリセット
	jest.clearAllMocks()
})

// グローバルのモック設定
jest.mock("fs/promises", () => ({
	mkdir: jest.fn(),
	writeFile: jest.fn(),
	readFile: jest.fn(),
	unlink: jest.fn(),
	readdir: jest.fn(),
	stat: jest.fn(),
	appendFile: jest.fn(),
	rm: jest.fn(),
	mkdtemp: jest.fn(),
}))

// エラーオブジェクトのモック
class MockErrnoException extends Error {
	code?: string
	constructor(message: string, code?: string) {
		super(message)
		this.name = "MockErrnoException"
		this.code = code
	}
}

// グローバルなモックヘルパー
global.createMockError = (code: string, message: string = "") => {
	return new MockErrnoException(message, code)
}

// テスト用のユーティリティ関数
global.createTestFile = (path: string, content: string = "") => {
	const fs = require("fs/promises")
	fs.writeFile.mockResolvedValueOnce(undefined)
	fs.stat.mockResolvedValueOnce({ size: Buffer.byteLength(content) })
	fs.readFile.mockResolvedValueOnce(content)
	return { path, content }
}
