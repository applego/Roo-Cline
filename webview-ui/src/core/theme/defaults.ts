import { ThemeState } from "./types"

export const DEFAULT_LIGHT_THEME: ThemeState = {
	type: "light",
	colors: {
		primary: "#007acc",
		secondary: "#6c757d",
		background: "#ffffff",
		text: "#000000",
	},
}

export const DEFAULT_DARK_THEME: ThemeState = {
	type: "dark",
	colors: {
		primary: "#0098ff",
		secondary: "#6c757d",
		background: "#1e1e1e",
		text: "#ffffff",
	},
}
