import { McpServerConfig } from "./mcp"

export interface RooConfig {
	preferredLanguage: string
	customInstructions: string
	modePrompts: Record<string, string>
	apiConfig: {
		default: {
			provider: string
			apiKey: string
		}
		mcpServers?: Record<string, McpServerConfig>
		[key: string]:
			| {
					provider: string
					apiKey: string
			  }
			| Record<string, McpServerConfig>
			| undefined
	}
}
