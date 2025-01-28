import React from "react"
import styled from "styled-components"

interface SettingsPanelProps {
	onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
	return (
		<StyledPanel>
			<Header>
				<Title>Settings</Title>
				<CloseButton onClick={onClose}>×</CloseButton>
			</Header>
			<Content>
				<Section>
					<SectionTitle>Preferred Language</SectionTitle>
					<LanguageSelect />
				</Section>
				<Section>
					<SectionTitle>Custom Instructions</SectionTitle>
					<CustomInstructionsEditor />
				</Section>
				<Section>
					<SectionTitle>Mode-Specific Prompts</SectionTitle>
					<ModePromptsManager />
				</Section>
				<Section>
					<SectionTitle>API Configuration</SectionTitle>
					<ApiConfigManager />
				</Section>
				<Section>
					<SectionTitle>Available Tools</SectionTitle>
					<ToolsManager />
				</Section>
			</Content>
		</StyledPanel>
	)
}
