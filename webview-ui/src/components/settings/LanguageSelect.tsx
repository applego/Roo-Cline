import React from "react"
import styled from "styled-components"
import { useSettings } from "../../hooks/useSettings"

const Select = styled.select`
	padding: 0.5rem;
	border-radius: 4px;
	background-color: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border);
	width: 200px;

	&:focus {
		outline: none;
		border-color: var(--vscode-focusBorder);
	}
`

const languages = [
	{ code: "en", name: "English" },
	{ code: "ja", name: "日本語" },
	// 他の言語を追加可能
]

export const LanguageSelect: React.FC = () => {
	const { settings, updateSettings } = useSettings()

	const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		updateSettings({ ...settings, language: e.target.value })
	}

	return (
		<Select value={settings.language} onChange={handleLanguageChange}>
			{languages.map((lang) => (
				<option key={lang.code} value={lang.code}>
					{lang.name}
				</option>
			))}
		</Select>
	)
}
