export const vscode = {
	postMessage: jest.fn((message: unknown) => {
		if (message && typeof message === "object" && "type" in message) {
			switch ((message as any).type) {
				case "requestVsCodeLmModels":
					// ExtensionMessage.tsの定義に合わせて、オプショナルなプロパティを使用
					return {
						type: "vsCodeLmModels",
						vsCodeLmModels: [
							{
								vendor: "mock-vendor", // オプショナルだが値を提供
								family: "mock-family", // オプショナルだが値を提供
								version: "1.0", // オプショナルだが値を提供
								id: "mock-model", // オプショナルだが値を提供
							},
						],
					}
				default:
					console.log("Mock vscode.postMessage called with:", message)
					return
			}
		}
		console.log("Mock vscode.postMessage called with:", message)
	}),
}

export const acquireVsCodeApi = jest.fn(() => ({
	postMessage: vscode.postMessage,
	getState: jest.fn(() => null),
	setState: jest.fn(),
}))
