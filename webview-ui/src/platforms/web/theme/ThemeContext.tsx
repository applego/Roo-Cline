import React, { createContext, useContext, useEffect, useState } from "react"
import { ThemeAdapter, ThemeState } from "../../../core/theme/types"
import { DEFAULT_LIGHT_THEME } from "../../../core/theme/defaults"

interface ThemeContextValue extends ThemeState {
	updateTheme: (theme: Partial<ThemeState>) => void
}

interface ThemeProviderProps {
	adapter: ThemeAdapter
	children: React.ReactNode
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ adapter, children }) => {
	const [theme, setThemeState] = useState<ThemeState>(DEFAULT_LIGHT_THEME)

	useEffect(() => {
		const handleThemeChange = (newTheme: ThemeState) => {
			setThemeState(newTheme)
		}

		adapter.on("themeChanged", handleThemeChange)
		adapter.initialize().catch(console.error)

		return () => {
			adapter.off("themeChanged", handleThemeChange)
			adapter.dispose()
		}
	}, [adapter])

	const updateTheme = (newTheme: Partial<ThemeState>) => {
		adapter.updateTheme(newTheme)
	}

	const value: ThemeContextValue = {
		...theme,
		updateTheme,
	}

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}
	return context
}
