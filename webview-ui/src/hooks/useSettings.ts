import { useState, useEffect } from "react"

export interface Settings {
	language: string
	customInstructions: string
	modePrompts: Record<string, string>
	apiConfig: {
		provider: string
		apiKey: string
		model: string
	}
	tools: string[]
}

const defaultSettings: Settings = {
	language: "en",
	customInstructions: "",
	modePrompts: {},
	apiConfig: {
		provider: "openai",
		apiKey: "",
		model: "gpt-4",
	},
	tools: [],
}

export const useSettings = () => {
	const [settings, setSettings] = useState<Settings>(() => {
		const savedSettings = localStorage.getItem("settings")
		return savedSettings ? JSON.parse(savedSettings) : defaultSettings
	})

	const updateSettings = (newSettings: Settings) => {
		setSettings(newSettings)
		localStorage.setItem("settings", JSON.stringify(newSettings))
	}

	useEffect(() => {
		const savedSettings = localStorage.getItem("settings")
		if (!savedSettings) {
			localStorage.setItem("settings", JSON.stringify(defaultSettings))
		}
	}, [])

	return { settings, updateSettings }
}
