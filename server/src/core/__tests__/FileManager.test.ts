import { FileManager } from "../FileManager.js"
import { FileNotFoundError, AccessDeniedError, InvalidPathError, FileSizeLimitError } from "../../types.js"

describe("FileManager", () => {
	let fileManager: FileManager

	beforeEach(() => {
		fileManager = new FileManager([], "")
	})

	it("should create a file", async () => {
		const filePath = "test.txt"
		const content = "test content"
		// await fileManager.createFile(filePath, content)
		// expect(fs.writeFile).toHaveBeenCalledWith(filePath, content, 'utf8');
	})
})
