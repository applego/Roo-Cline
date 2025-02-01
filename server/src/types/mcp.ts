export interface McpServerConfig {
	command: string
	args?: string[]
	env?: Record<string, string>
}

export interface McpToolResult {
	content: Array<{
		type: string
		text: string
	}>
	isError?: boolean
}
