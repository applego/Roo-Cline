import fs from "fs/promises"
import path from "path"
import { RooConfig } from "../types/config.js"

const CONFIG_FILE = "config.json"

export class ConfigStore {
	private configDir: string

	constructor(configDir: string) {
		this.configDir = configDir
	}

	async load(): Promise<RooConfig> {
		const configPath = path.join(this.configDir, CONFIG_FILE)
		try {
			const data = await fs.readFile(configPath, "utf8")
			return JSON.parse(data)
		} catch (error: any) {
			if (error.code === "ENOENT") {
				console.warn(`Config file not found at ${configPath}, using default config`)
				return this.getDefaultConfig()
			}
			throw error
		}
	}

	async save(config: RooConfig): Promise<void> {
		const configPath = path.join(this.configDir, CONFIG_FILE)
		await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8")
	}

	getDefaultConfig(): RooConfig {
		return {
			preferredLanguage: "en",
			customInstructions: "",
			modePrompts: {},
			apiConfig: {
				default: {
					provider: "",
					apiKey: "",
				},
			},
		}
	}
}
