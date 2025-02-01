import React from "react"
import styled from "styled-components"
import { useSettings } from "../../hooks/useSettings"

const TextArea = styled.textarea`
	width: 100%;
	min-height: 200px;
	padding: 0.5rem;
	border-radius: 4px;
	background-color: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border);
	resize: vertical;
	font-family: var(--vscode-editor-font-family);
	font-size: var(--vscode-editor-font-size);

	&:focus {
		outline: none;
		border-color: var(--vscode-focusBorder);
	}
`

const Description = styled.p`
	margin: 0 0 0.5rem;
	color: var(--vscode-descriptionForeground);
	font-size: 0.9rem;
`

export const CustomInstructionsEditor: React.FC = () => {
	const { settings, updateSettings } = useSettings()

	const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		updateSettings({
			...settings,
			customInstructions: e.target.value,
		})
	}

	return (
		<div>
			<Description>
				カスタムインストラクションを設定して、AIアシスタントの動作をカスタマイズできます。
			</Description>
			<TextArea
				value={settings.customInstructions}
				onChange={handleInstructionsChange}
				placeholder="カスタムインストラクションを入力してください..."
			/>
		</div>
	)
}
