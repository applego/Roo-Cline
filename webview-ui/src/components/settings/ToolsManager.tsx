import React from "react"
import styled from "styled-components"
import { useSettings } from "../../hooks/useSettings"

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`

const ToolItem = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	border: 1px solid var(--vscode-input-border);
	border-radius: 4px;
`

const Checkbox = styled.input`
	margin: 0;
	cursor: pointer;
`

const ToolName = styled.span`
	flex-grow: 1;
`

const Description = styled.p`
	margin: 0 0 1rem;
	color: var(--vscode-descriptionForeground);
	font-size: 0.9rem;
`

const availableTools = [
	{ id: "codebase_search", name: "コードベース検索", description: "プロジェクト内のコードを検索します" },
	{ id: "file_search", name: "ファイル検索", description: "ファイル名で検索します" },
	{ id: "grep_search", name: "Grep検索", description: "正規表現でファイル内を検索します" },
	{ id: "run_terminal_cmd", name: "ターミナルコマンド実行", description: "シェルコマンドを実行します" },
	{ id: "edit_file", name: "ファイル編集", description: "ファイルの内容を編集します" },
]

export const ToolsManager: React.FC = () => {
	const { settings, updateSettings } = useSettings()

	const handleToolToggle = (toolId: string) => {
		const newTools = settings.tools.includes(toolId)
			? settings.tools.filter((id) => id !== toolId)
			: [...settings.tools, toolId]

		updateSettings({
			...settings,
			tools: newTools,
		})
	}

	return (
		<Container>
			<Description>AIアシスタントが使用できるツールを選択してください。</Description>
			{availableTools.map((tool) => (
				<ToolItem key={tool.id}>
					<Checkbox
						type="checkbox"
						checked={settings.tools.includes(tool.id)}
						onChange={() => handleToolToggle(tool.id)}
					/>
					<div>
						<ToolName>{tool.name}</ToolName>
						<Description>{tool.description}</Description>
					</div>
				</ToolItem>
			))}
		</Container>
	)
}
