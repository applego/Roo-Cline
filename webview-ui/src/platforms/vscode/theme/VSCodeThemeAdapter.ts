import { EventEmitter } from "../../../utils/EventEmitter"
import { ThemeAdapter, ThemeState, ThemeError } from "../../../core/theme/types"
import { DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from "../../../core/theme/defaults"
import { vscode } from "../../../utils/vscode"

export class VSCodeThemeAdapter extends EventEmitter implements ThemeAdapter {
	private currentTheme: ThemeState

	constructor() {
		super()
		this.currentTheme = DEFAULT_LIGHT_THEME
	}

	async initialize(): Promise<void> {
		try {
			// VSCodeのテーマ情報を取得
			const theme = this.getVSCodeTheme()
			this.currentTheme = theme
			this.emit("themeChanged", theme)

			// メッセージハンドラを設定
			window.addEventListener("message", this.handleMessage)
		} catch (error) {
			throw new ThemeError("Failed to initialize VSCode theme adapter")
		}
	}

	private handleMessage = (event: MessageEvent) => {
		const message = event.data
		if (message.type === "theme-changed") {
			const theme = this.getVSCodeTheme()
			this.currentTheme = theme
			this.emit("themeChanged", theme)
		}
	}

	getTheme(): ThemeState {
		return this.currentTheme
	}

	updateTheme(theme: Partial<ThemeState>): void {
		this.currentTheme = { ...this.currentTheme, ...theme }
		this.emit("themeChanged", this.currentTheme)
	}

	private getVSCodeTheme(): ThemeState {
		try {
			// VSCodeのテーマ情報を取得
			vscode.postMessage({ type: "getTheme" })
			const isDark = document.body.classList.contains("vscode-dark")

			const baseTheme = isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME

			// CSSカスタムプロパティからカラーを取得
			const computedStyle = getComputedStyle(document.documentElement)
			const colors = {
				primary: computedStyle.getPropertyValue("--vscode-button-background") || baseTheme.colors.primary,
				secondary:
					computedStyle.getPropertyValue("--vscode-button-secondaryBackground") || baseTheme.colors.secondary,
				background: computedStyle.getPropertyValue("--vscode-editor-background") || baseTheme.colors.background,
				text: computedStyle.getPropertyValue("--vscode-editor-foreground") || baseTheme.colors.text,
			}

			return {
				type: isDark ? "dark" : "light",
				colors,
			}
		} catch (error) {
			console.error("Failed to get VSCode theme:", error)
			return DEFAULT_LIGHT_THEME
		}
	}

	dispose(): void {
		window.removeEventListener("message", this.handleMessage)
	}
}
