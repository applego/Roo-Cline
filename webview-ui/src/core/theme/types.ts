import { EventEmitter } from "../../utils/EventEmitter"

export interface ThemeColors {
	primary: string
	secondary: string
	background: string
	text: string
}

export type ThemeType = "light" | "dark"

export interface ThemeState {
	type: ThemeType
	colors: ThemeColors
}

export class ThemeError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "ThemeError"
	}
}

export interface ThemeAdapter extends EventEmitter {
	/**
	 * テーマアダプターを初期化します
	 */
	initialize(): Promise<void>

	/**
	 * 現在のテーマ状態を取得します
	 */
	getTheme(): ThemeState

	/**
	 * テーマを更新します
	 * @param theme 更新するテーマの部分的な状態
	 */
	updateTheme(theme: Partial<ThemeState>): void

	/**
	 * テーマアダプターを破棄します
	 */
	dispose(): void
}

export const ThemeEvents = {
	/**
	 * テーマが変更されたときに発火するイベント
	 */
	THEME_CHANGED: "themeChanged",
} as const

export type ThemeEvent = (typeof ThemeEvents)[keyof typeof ThemeEvents]

// テーマの依存関係の型
export interface ThemeDependencies {
	adapter: ThemeAdapter
}

// テーマの設定オプションの型
export interface ThemeOptions {
	defaultTheme?: ThemeType
	transitionDuration?: number
	persistTheme?: boolean
}

// テーマのコンテキスト値の型
export interface ThemeContextValue extends ThemeState {
	updateTheme: (theme: Partial<ThemeState>) => void
}
