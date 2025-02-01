import { Client, StdioClientTransport } from "@modelcontextprotocol/sdk"

export class McpManager {
	private connections: Map<string, Client> = new Map()

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

	async callTool(serverName: string, toolName: string, args: any): Promise<any> {
		const client = this.connections.get(serverName)
		if (!client) {
			throw new Error(`No connection to MCP server ${serverName}`)
		}

		return await client.request("callTool", {
			name: toolName,
			arguments: args,
		})
	}
}
