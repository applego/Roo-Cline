import styled from "styled-components"

export const StyledPanel = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	background-color: var(--vscode-editor-background);
	color: var(--vscode-editor-foreground);
`

export const Content = styled.div`
	display: flex;
	flex-direction: column;
	padding: 1rem;
	gap: 1rem;
	overflow-y: auto;
`

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`

export const SectionTitle = styled.h2`
	font-size: 1.1rem;
	font-weight: 600;
	margin: 0;
	color: var(--vscode-editor-foreground);
`
