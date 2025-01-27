export interface LanguageModelChatSelector {
	vendor?: string
	family?: string
	version?: string
	id?: string
}

export interface VSCodeLmModel extends LanguageModelChatSelector {
	// 追加のプロパティがあれば定義
}

export interface LmStudioModel extends LanguageModelChatSelector {
	// 追加のプロパティがあれば定義
}
