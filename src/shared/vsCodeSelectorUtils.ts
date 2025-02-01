import { LanguageModelChatSelector } from "vscode"

export const SELECTOR_SEPARATOR = "/"

export function stringifyVsCodeLmModelSelector(selector: LanguageModelChatSelector): string {
	if (!selector) {
		return "default"
	}

	const parts = [selector.vendor ?? "", selector.family ?? "", selector.version ?? "", selector.id ?? ""].filter(
		Boolean,
	)

	return parts.length > 0 ? parts.join(SELECTOR_SEPARATOR) : "default"
}
