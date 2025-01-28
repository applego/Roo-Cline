import { promises as fs } from "fs"
import path from "path"

export class ConfigStore {
	private configPath: string

	constructor(configDir: string) {
		this.configPath = path.join(configDir, "roo-config.json")
	}

	async load(): Promise<RooConfig> {
		try {
			const data = await fs.readFile(this.configPath, "utf-8")
			return JSON.parse(data)
		} catch (error) {
			return this.getDefaultConfig()
		}
	}

	async save(config: RooConfig): Promise<void> {
		await fs.writeFile(this.configPath, JSON.stringify(config, null, 2))
	}

	private getDefaultConfig(): RooConfig {
		return {
			preferredLanguage: "en",
			customInstructions: "",
			modePrompts: {},
			apiConfig: {
				default: {
					provider: "openai",
					apiKey: "",
				},
			},
		}
	}
}
