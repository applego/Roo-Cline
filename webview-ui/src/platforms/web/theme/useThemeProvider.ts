import { useMemo } from "react"
import { VSCodeThemeAdapter } from "../../../platforms/vscode/theme/VSCodeThemeAdapter"
import { WebThemeAdapter } from "../../../platforms/web/theme/WebThemeAdapter"
import { isVSCodeEnvironment } from "../../../utils/environment"
import { ThemeAdapter } from "../../../core/theme/types"

/**
 * 環境に応じたThemeAdapterを提供するカスタムフック
 */
export const useThemeProvider = (): ThemeAdapter => {
	return useMemo(() => {
		// VS Code環境の場合はVSCodeThemeAdapterを、
		// それ以外（ブラウザ環境）の場合はWebThemeAdapterを返す
		return isVSCodeEnvironment() ? new VSCodeThemeAdapter() : new WebThemeAdapter()
	}, [])
}

/**
 * WebThemeAdapterを提供するカスタムフック
 * Web環境専用の機能を使用する場合に利用
 */
export const useWebThemeProvider = (): WebThemeAdapter => {
	return useMemo(() => new WebThemeAdapter(), [])
}

/**
 * VSCodeThemeAdapterを提供するカスタムフック
 * VS Code環境専用の機能を使用する場合に利用
 */
export const useVSCodeThemeProvider = (): VSCodeThemeAdapter => {
	return useMemo(() => new VSCodeThemeAdapter(), [])
}
