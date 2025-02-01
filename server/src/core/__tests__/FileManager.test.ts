import { FileManager } from "../FileManager"
import { FileNotFoundError, AccessDeniedError, InvalidPathError, FileSizeLimitError } from "../../types"
import fs from "fs/promises"
import path from "path"
import os from "os"

describe("FileManager", () => {
	let fileManager: FileManager
	let testDir: string
	let auditLogPath: string

	beforeEach(async () => {
		// テスト用の一時ディレクトリを作成
		testDir = await fs.mkdtemp(path.join(os.tmpdir(), "file-manager-test-"))
		auditLogPath = path.join(testDir, "audit.log")

		// FileManagerインスタンスを作成
		fileManager = new FileManager([testDir], auditLogPath)
	})

	afterEach(async () => {
		// テスト用ディレクトリを削除
		await fs.rm(testDir, { recursive: true, force: true })
	})

	describe("読み込み操作", () => {
		it("ファイルを正常に読み込める", async () => {
			const testFile = path.join(testDir, "test.txt")
			const content = "テストコンテンツ"
			await fs.writeFile(testFile, content)

			const result = await fileManager.executeOperation({
				type: "read",
				path: testFile,
			})

			expect(result.success).toBe(true)
			expect(result.data).toBe(content)
		})

		it("存在しないファイルの読み込みでエラー", async () => {
			const result = await fileManager.executeOperation({
				type: "read",
				path: path.join(testDir, "nonexistent.txt"),
			})

			expect(result.success).toBe(false)
			expect(result.error).toContain("File not found")
		})
	})

	describe("書き込み操作", () => {
		it("ファイルを正常に書き込める", async () => {
			const testFile = path.join(testDir, "write-test.txt")
			const content = "テスト書き込み"

			const result = await fileManager.executeOperation({
				type: "write",
				path: testFile,
				content,
			})

			expect(result.success).toBe(true)
			const writtenContent = await fs.readFile(testFile, "utf8")
			expect(writtenContent).toBe(content)
		})

		it("許可されていないパスへの書き込みでエラー", async () => {
			const result = await fileManager.executeOperation({
				type: "write",
				path: "/etc/test.txt",
				content: "test",
			})

			expect(result.success).toBe(false)
			expect(result.error).toContain("Access denied")
		})
	})

	describe("ファイル一覧操作", () => {
		it("ディレクトリの内容を正しく一覧表示できる", async () => {
			// テストファイルを作成
			await fs.writeFile(path.join(testDir, "file1.txt"), "content1")
			await fs.writeFile(path.join(testDir, "file2.txt"), "content2")
			await fs.mkdir(path.join(testDir, "subdir"))

			const result = await fileManager.executeOperation({
				type: "list",
				path: testDir,
			})

			expect(result.success).toBe(true)
			expect(result.data).toHaveLength(3)
			expect(result.data.map((f: any) => f.name)).toContain("file1.txt")
			expect(result.data.map((f: any) => f.name)).toContain("file2.txt")
			expect(result.data.map((f: any) => f.name)).toContain("subdir")
		})
	})

	describe("検索操作", () => {
		it("パターンに一致するファイルを検索できる", async () => {
			// テストファイルを作成
			await fs.writeFile(path.join(testDir, "test1.txt"), "content1")
			await fs.writeFile(path.join(testDir, "test2.txt"), "content2")
			await fs.writeFile(path.join(testDir, "other.txt"), "content3")

			const result = await fileManager.executeOperation({
				type: "search",
				path: testDir,
				pattern: "^test.*\\.txt$",
			})

			expect(result.success).toBe(true)
			expect(result.data).toHaveLength(2)
			expect(result.data.some((p: string) => p.endsWith("test1.txt"))).toBe(true)
			expect(result.data.some((p: string) => p.endsWith("test2.txt"))).toBe(true)
		})
	})

	describe("監査ログ", () => {
		it("操作が正しく記録される", async () => {
			const testFile = path.join(testDir, "audit-test.txt")

			await fileManager.executeOperation({
				type: "write",
				path: testFile,
				content: "test content",
			})

			const logContent = await fs.readFile(auditLogPath, "utf8")
			const logEntry = JSON.parse(logContent.split("\n")[0])

			expect(logEntry.operation.type).toBe("write")
			expect(logEntry.operation.path).toBe(testFile)
			expect(logEntry.result.success).toBe(true)
		})
	})
})
