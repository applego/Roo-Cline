import fs from "fs/promises"
import path from "path"
import {
	FileOperation,
	FileOperationResult,
	FileNotFoundError,
	AccessDeniedError,
	InvalidPathError,
	FileSizeLimitError,
} from "../types.js"

export class FileManager {
	private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
	private readonly allowedPaths: string[]
	private readonly auditLogPath: string

	constructor(allowedPaths: string[], auditLogPath: string) {
		this.allowedPaths = allowedPaths.map((p) => path.resolve(p))
		this.auditLogPath = auditLogPath
	}

	private async logOperation(operation: FileOperation, result: FileOperationResult): Promise<void> {
		const logEntry = {
			timestamp: new Date().toISOString(),
			operation,
			result,
		}

		try {
			await fs.appendFile(this.auditLogPath, JSON.stringify(logEntry) + "\n", "utf8")
		} catch (error) {
			console.error("Failed to write audit log:", error)
		}
	}

	private validatePath(filePath: string): void {
		const resolvedPath = path.resolve(filePath)
		const isAllowed = this.allowedPaths.some((allowedPath) => resolvedPath.startsWith(allowedPath))

		if (!isAllowed) {
			throw new AccessDeniedError(filePath)
		}

		// ディレクトリトラバーサル対策
		if (resolvedPath.includes("..")) {
			throw new InvalidPathError(filePath)
		}
	}

	public async executeOperation(operation: FileOperation): Promise<FileOperationResult> {
		try {
			this.validatePath(operation.path)

			let result: FileOperationResult

			switch (operation.type) {
				case "read":
					result = await this.readFile(operation.path)
					break
				case "write":
					result = await this.writeFile(operation.path, operation.content!)
					break
				case "delete":
					result = await this.deleteFile(operation.path)
					break
				case "list":
					result = await this.listFiles(operation.path)
					break
				case "search":
					result = await this.searchFiles(operation.path, operation.pattern!)
					break
				default:
					result = { success: false, error: "Invalid operation type" }
			}

			await this.logOperation(operation, result)
			return result
		} catch (error) {
			const result: FileOperationResult = {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			}
			await this.logOperation(operation, result)
			return result
		}
	}

	private async readFile(filePath: string): Promise<FileOperationResult> {
		try {
			const stats = await fs.stat(filePath)

			if (stats.size > this.MAX_FILE_SIZE) {
				throw new FileSizeLimitError(filePath, stats.size, this.MAX_FILE_SIZE)
			}

			const content = await fs.readFile(filePath, "utf8")
			return { success: true, data: content }
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				throw new FileNotFoundError(filePath)
			}
			throw error
		}
	}

	private async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
		try {
			if (Buffer.byteLength(content) > this.MAX_FILE_SIZE) {
				throw new FileSizeLimitError(filePath, Buffer.byteLength(content), this.MAX_FILE_SIZE)
			}

			await fs.mkdir(path.dirname(filePath), { recursive: true })
			await fs.writeFile(filePath, content, "utf8")
			return { success: true }
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "EACCES") {
				throw new AccessDeniedError(filePath)
			}
			throw error
		}
	}

	private async deleteFile(filePath: string): Promise<FileOperationResult> {
		try {
			await fs.unlink(filePath)
			return { success: true }
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				throw new FileNotFoundError(filePath)
			}
			throw error
		}
	}

	private async listFiles(dirPath: string): Promise<FileOperationResult> {
		try {
			const files = await fs.readdir(dirPath, { withFileTypes: true })
			const fileList = files.map((file) => ({
				name: file.name,
				isDirectory: file.isDirectory(),
				path: path.join(dirPath, file.name),
			}))
			return { success: true, data: fileList }
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				throw new FileNotFoundError(dirPath)
			}
			throw error
		}
	}

	private async searchFiles(dirPath: string, pattern: string): Promise<FileOperationResult> {
		try {
			const regex = new RegExp(pattern)
			const results: string[] = []

			async function* walk(dir: string): AsyncGenerator<string> {
				const files = await fs.readdir(dir, { withFileTypes: true })
				for (const file of files) {
					const filePath = path.join(dir, file.name)
					if (file.isDirectory()) {
						yield* walk(filePath)
					} else if (regex.test(file.name)) {
						yield filePath
					}
				}
			}

			for await (const filePath of walk(dirPath)) {
				results.push(filePath)
			}

			return { success: true, data: results }
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				throw new FileNotFoundError(dirPath)
			}
			throw error
		}
	}
}
