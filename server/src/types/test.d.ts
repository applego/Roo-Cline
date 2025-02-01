declare global {
	namespace NodeJS {
		interface Global {
			createMockError: (code: string, message?: string) => Error & { code?: string }
			createTestFile: (path: string, content?: string) => { path: string; content: string }
		}
	}
}

export {}
