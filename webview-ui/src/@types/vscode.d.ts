// VSCode型定義
declare module "vscode" {
	// 必要最小限のインターフェース定義
	export interface LanguageModelChatSelector {
		vendor: string
		family: string
	}
}

// Node.js専用モジュールの型定義
declare module "mammoth" {
	const content: any
	export default content
}

declare module "isbinaryfile" {
	export function isBinaryFile(buffer: Buffer): Promise<boolean>
}

declare module "pdf-parse" {
	const content: any
	export default content
}

// VSCRUIの型定義
declare module "vscrui" {
	export interface CheckboxProps {
		checked?: boolean
		onChange?: (checked: boolean) => void
	}

	export interface DropdownProps {
		value?: string
		onChange?: (value: string) => void
	}

	export const Checkbox: React.FC<CheckboxProps>
	export const Dropdown: React.FC<DropdownProps>
}
