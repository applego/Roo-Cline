import React from "react"
import { StyledPanel, Content, Section, SectionTitle } from "../common/StyledComponents"
import { LanguageSelect } from "./LanguageSelect"
import { CustomInstructionsEditor } from "./CustomInstructionsEditor"
import { ModePromptsManager } from "./ModePromptsManager"
import ApiConfigManager from "./ApiConfigManager"
import { ToolsManager } from "./ToolsManager"

export const SettingsPanel: React.FC = () => {
	return (
		<StyledPanel>
			<Content>
				<Section>
					<SectionTitle>言語設定</SectionTitle>
					<LanguageSelect />
				</Section>
				<Section>
					<SectionTitle>カスタムインストラクション</SectionTitle>
					<CustomInstructionsEditor />
				</Section>
				<Section>
					<SectionTitle>モード別プロンプト</SectionTitle>
					<ModePromptsManager />
				</Section>
				<Section>
					<SectionTitle>API設定</SectionTitle>
					<ApiConfigManager
						currentApiConfigName=""
						listApiConfigMeta={[]}
						onSelectConfig={() => {}}
						onDeleteConfig={() => {}}
						onRenameConfig={() => {}}
						onUpsertConfig={() => {}}
					/>
				</Section>
				<Section>
					<SectionTitle>利用可能なツール</SectionTitle>
					<ToolsManager />
				</Section>
			</Content>
		</StyledPanel>
	)
}
