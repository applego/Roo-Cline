import fs from "fs/promises"
import path from "path"

export interface ApiConfig {
	apiKey: string
	endpoint: string
}

export class ConfigStore {
	private configPath: string

	constructor() {
		this.configPath = path.join(process.cwd(), "config.json")
	}

	async saveConfig(config: ApiConfig): Promise<void> {
		await fs.writeFile(this.configPath, JSON.stringify(config, null, 2))
	}

	async loadConfig(): Promise<ApiConfig> {
		try {
			const configData = await fs.readFile(this.configPath, "utf-8")
			return JSON.parse(configData)
		} catch (error) {
			if (error instanceof Error && "code" in error && error.code === "ENOENT") {
				return {
					apiKey: "",
					endpoint: "",
				}
			}
			throw error
		}
	}
}
