import React, { useState } from "react"
import styled from "styled-components"
import { useSettings } from "../../hooks/useSettings"

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`

const ModePromptEditor = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
	border: 1px solid var(--vscode-input-border);
	border-radius: 4px;
`

const TextArea = styled.textarea`
	width: 100%;
	min-height: 100px;
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

const Button = styled.button`
	padding: 0.5rem 1rem;
	background-color: var(--vscode-button-background);
	color: var(--vscode-button-foreground);
	border: none;
	border-radius: 4px;
	cursor: pointer;

	&:hover {
		background-color: var(--vscode-button-hoverBackground);
	}
`

const ModeName = styled.input`
	padding: 0.5rem;
	border-radius: 4px;
	background-color: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border);

	&:focus {
		outline: none;
		border-color: var(--vscode-focusBorder);
	}
`

export const ModePromptsManager: React.FC = () => {
	const { settings, updateSettings } = useSettings()
	const [newMode, setNewMode] = useState("")
	const [newPrompt, setNewPrompt] = useState("")

	const handleAddMode = () => {
		if (newMode && newPrompt) {
			updateSettings({
				...settings,
				modePrompts: {
					...settings.modePrompts,
					[newMode]: newPrompt,
				},
			})
			setNewMode("")
			setNewPrompt("")
		}
	}

	const handleDeleteMode = (mode: string) => {
		const newModePrompts = { ...settings.modePrompts }
		delete newModePrompts[mode]
		updateSettings({
			...settings,
			modePrompts: newModePrompts,
		})
	}

	const handleUpdatePrompt = (mode: string, prompt: string) => {
		updateSettings({
			...settings,
			modePrompts: {
				...settings.modePrompts,
				[mode]: prompt,
			},
		})
	}

	return (
		<Container>
			{Object.entries(settings.modePrompts).map(([mode, prompt]) => (
				<ModePromptEditor key={mode}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<strong>{mode}</strong>
						<Button onClick={() => handleDeleteMode(mode)}>削除</Button>
					</div>
					<TextArea
						value={prompt}
						onChange={(e) => handleUpdatePrompt(mode, e.target.value)}
						placeholder="プロンプトを入力してください..."
					/>
				</ModePromptEditor>
			))}
			<ModePromptEditor>
				<ModeName value={newMode} onChange={(e) => setNewMode(e.target.value)} placeholder="新しいモード名" />
				<TextArea
					value={newPrompt}
					onChange={(e) => setNewPrompt(e.target.value)}
					placeholder="新しいモードのプロンプトを入力してください..."
				/>
				<Button onClick={handleAddMode}>追加</Button>
			</ModePromptEditor>
		</Container>
	)
}
