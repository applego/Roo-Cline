import { EventEmitter } from "../../../utils/EventEmitter"
import { ThemeAdapter, ThemeState, ThemeError } from "../../../core/theme/types"
import { DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from "../../../core/theme/defaults"

export class WebThemeAdapter extends EventEmitter implements ThemeAdapter {
	private currentTheme: ThemeState

	constructor() {
		super()
		this.currentTheme = this.getInitialTheme()
	}

	private getInitialTheme(): ThemeState {
		// システムのダークモード設定を確認
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
		return prefersDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME
	}

	async initialize(): Promise<void> {
		try {
			// システムのテーマ変更を監視
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
			mediaQuery.addEventListener("change", this.handleSystemThemeChange)

			// 初期テーマを設定
			this.emit("themeChanged", this.currentTheme)
		} catch (error) {
			throw new ThemeError("Failed to initialize web theme adapter")
		}
	}

	private handleSystemThemeChange = (event: MediaQueryListEvent) => {
		const newTheme = event.matches ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME
		this.updateTheme(newTheme)
	}

	getTheme(): ThemeState {
		return this.currentTheme
	}

	updateTheme(theme: Partial<ThemeState>): void {
		this.currentTheme = { ...this.currentTheme, ...theme }
		this.emit("themeChanged", this.currentTheme)

		// テーマに基づいてCSSカスタムプロパティを更新
		this.updateCSSVariables(this.currentTheme)
	}

	private updateCSSVariables(theme: ThemeState): void {
		const root = document.documentElement
		const { colors } = theme

		root.style.setProperty("--theme-primary", colors.primary)
		root.style.setProperty("--theme-secondary", colors.secondary)
		root.style.setProperty("--theme-background", colors.background)
		root.style.setProperty("--theme-text", colors.text)

		// ドキュメントのクラスを更新
		document.body.classList.remove("theme-light", "theme-dark")
		document.body.classList.add(`theme-${theme.type}`)
	}

	dispose(): void {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
		mediaQuery.removeEventListener("change", this.handleSystemThemeChange)
	}
}
