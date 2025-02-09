import { Client, StdioClientTransport } from "@modelcontextprotocol/sdk"
import { McpServerConfig, McpToolResult } from "../types/mcp"
import { ConfigStore } from "../config/ConfigStore"

export class McpManager {
	private connections: Map<string, Client> = new Map()

	constructor(private configStore: ConfigStore) {}

	async connectToServer(serverName: string, config: McpServerConfig): Promise<void> {
		try {
			const transport = new StdioClientTransport({
				command: config.command,
				args: config.args,
				env: config.env,
			})

			const client = new Client(transport)
			await client.connect()

			this.connections.set(serverName, client)
		} catch (error) {
			throw new Error(`Failed to connect to MCP server ${serverName}: ${error}`)
		}
	}

	async callTool(serverName: string, toolName: string, args: any): Promise<McpToolResult> {
		const client = this.connections.get(serverName)
		if (!client) {
			throw new Error(`No connection to MCP server ${serverName}`)
		}

		return await client.request("callTool", {
			name: toolName,
			arguments: args,
		})
	}

	async initialize(): Promise<void> {
		// 設定から登録済みのMCPサーバーを取得して接続
		const config = await this.configStore.load()
		const mcpServers = config.apiConfig?.mcpServers || {}

		for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
			await this.connectToServer(serverName, serverConfig as McpServerConfig)
		}
	}
}
