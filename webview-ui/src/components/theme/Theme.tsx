import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import "./Theme.css"

interface ThemeContextProps {
	theme: string
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

interface ThemeProviderProps {
	children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [theme, setTheme] = useState("light")

	useEffect(() => {
		document.body.className = theme
	}, [theme])

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
	}

	const value: ThemeContextProps = {
		theme,
		toggleTheme,
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

interface ThemeProps {
	children: ReactNode
}

export const Theme: React.FC<ThemeProps> = ({ children }) => {
	return <ThemeProvider>{children}</ThemeProvider>
}
