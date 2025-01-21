declare module "vscode" {
	export interface LanguageModelChatSelector {
		vendor?: string
		family?: string
	}

	// 必要に応じて他のVSCode関連の型定義を追加
	export interface ExtensionContext {
		subscriptions: { dispose(): any }[]
		extensionPath: string
		globalState: Memento
		workspaceState: Memento
		globalStoragePath: string
		storagePath?: string
	}

	export interface Memento {
		get<T>(key: string): T | undefined
		get<T>(key: string, defaultValue: T): T
		update(key: string, value: any): Thenable<void>
	}

	// VSCode API の追加の型定義
	export interface Uri {
		scheme: string
		authority: string
		path: string
		query: string
		fragment: string
		fsPath: string
		with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri
		toString(skipEncoding?: boolean): string
	}

	export interface TextDocument {
		uri: Uri
		fileName: string
		isUntitled: boolean
		languageId: string
		version: number
		isDirty: boolean
		isClosed: boolean
		save(): Thenable<boolean>
		getText(range?: Range): string
		getWordRangeAtPosition(position: Position): Range | undefined
		lineAt(line: number | Position): TextLine
		lineCount: number
		offsetAt(position: Position): number
		positionAt(offset: number): Position
		validateRange(range: Range): Range
		validatePosition(position: Position): Position
	}

	export interface Position {
		line: number
		character: number
		translate(lineDelta?: number, characterDelta?: number): Position
		with(line?: number, character?: number): Position
		compareTo(other: Position): number
		isEqual(other: Position): boolean
		isAfter(other: Position): boolean
		isBefore(other: Position): boolean
	}

	export interface Range {
		start: Position
		end: Position
		isEmpty: boolean
		isSingleLine: boolean
		contains(positionOrRange: Position | Range): boolean
		intersection(range: Range): Range | undefined
		union(other: Range): Range
		with(start?: Position, end?: Position): Range
	}

	export interface TextLine {
		lineNumber: number
		text: string
		range: Range
		rangeIncludingLineBreak: Range
		firstNonWhitespaceCharacterIndex: number
		isEmptyOrWhitespace: boolean
	}
}

declare module "vscrui" {
	import { FC } from "react"

	export interface DropdownOption {
		text: string
		value: string
	}

	export interface CheckboxProps {
		checked?: boolean
		onChange?: (checked: boolean) => void
		disabled?: boolean
		children?: React.ReactNode
	}

	export interface DropdownProps {
		options: DropdownOption[]
		value?: string
		onChange?: (value: string) => void
		disabled?: boolean
	}

	export const Checkbox: FC<CheckboxProps>
	export const Dropdown: FC<DropdownProps>
}

declare global {
	interface Window {
		acquireVsCodeApi?: () => {
			postMessage: (message: any) => void
			getState: () => any
			setState: (state: any) => void
		}
	}
}
