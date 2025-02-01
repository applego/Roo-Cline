import React, { createContext, useCallback, useContext, useState } from "react"
import { ExtensionStateContextType } from "./ExtensionStateContext"
import { ExtensionState } from "../../../src/shared/ExtensionMessage"
import { WebSocketHandler } from "../services/api/websocket-handler"
import { defaultModeSlug, defaultPrompts } from "../../../src/shared/modes"
import { StandaloneMessage, convertToWebviewMessage } from "../types/messages"

// スタンドアロンモード用のWebSocket接続
const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:3000/ws"
const ws = new WebSocketHandler(wsUrl)

export const StandaloneStateContext = createContext<ExtensionStateContextType | undefined>(undefined)

export const StandaloneStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<ExtensionState>({
		version: "1.0.0",
		clineMessages: [],
		taskHistory: [],
		shouldShowAnnouncement: false,
		allowedCommands: [],
		soundEnabled: false,
		soundVolume: 0.5,
		diffEnabled: false,
		fuzzyMatchThreshold: 1.0,
		preferredLanguage: "English",
		writeDelayMs: 1000,
		browserViewportSize: "900x600",
		screenshotQuality: 75,
		terminalOutputLineLimit: 500,
		mcpEnabled: true,
		alwaysApproveResubmit: false,
		requestDelaySeconds: 5,
		currentApiConfigName: "default",
		listApiConfigMeta: [],
		mode: defaultModeSlug,
		customPrompts: defaultPrompts,
		enhancementApiConfigId: "",
		experimentalDiffStrategy: false,
		autoApprovalEnabled: false,
	})

	const [didHydrateState] = useState(true)
	const [showWelcome] = useState(false)
	const [theme] = useState<any>(undefined)
	const [filePaths] = useState<string[]>([])
	const [glamaModels] = useState({})
	const [openRouterModels] = useState({})
	const [openAiModels] = useState<string[]>([])
	const [mcpServers] = useState([])

	// WebSocket通信を使用してメッセージを送信
	const sendMessage = useCallback((message: StandaloneMessage) => {
		ws.send(message).catch(console.error)
	}, [])

	// WebSocketからのメッセージを処理
	ws.onMessage((message) => {
		switch (message.type) {
			case "state":
				if (message.state) {
					setState((prevState) => ({
						...prevState,
						...message.state,
					}))
				}
				break
			// 他のメッセージタイプの処理...
		}
	})

	const contextValue: ExtensionStateContextType = {
		...state,
		didHydrateState,
		showWelcome,
		theme,
		glamaModels,
		openRouterModels,
		openAiModels,
		mcpServers,
		filePaths,
		soundVolume: state.soundVolume,
		fuzzyMatchThreshold: state.fuzzyMatchThreshold,
		writeDelayMs: state.writeDelayMs,
		screenshotQuality: state.screenshotQuality,
		experimentalDiffStrategy: state.experimentalDiffStrategy ?? false,
		setApiConfiguration: (value) => {
			setState((prevState) => ({ ...prevState, apiConfiguration: value }))
			sendMessage({
				type: "upsertApiConfiguration" as const,
				apiConfiguration: value,
			})
		},
		setCustomInstructions: (value) => setState((prevState) => ({ ...prevState, customInstructions: value })),
		setAlwaysAllowReadOnly: (value) => setState((prevState) => ({ ...prevState, alwaysAllowReadOnly: value })),
		setAlwaysAllowWrite: (value) => setState((prevState) => ({ ...prevState, alwaysAllowWrite: value })),
		setAlwaysAllowExecute: (value) => setState((prevState) => ({ ...prevState, alwaysAllowExecute: value })),
		setAlwaysAllowBrowser: (value) => setState((prevState) => ({ ...prevState, alwaysAllowBrowser: value })),
		setAlwaysAllowMcp: (value) => setState((prevState) => ({ ...prevState, alwaysAllowMcp: value })),
		setShowAnnouncement: (value) => setState((prevState) => ({ ...prevState, shouldShowAnnouncement: value })),
		setAllowedCommands: (value) => setState((prevState) => ({ ...prevState, allowedCommands: value })),
		setSoundEnabled: (value) => setState((prevState) => ({ ...prevState, soundEnabled: value })),
		setSoundVolume: (value) => setState((prevState) => ({ ...prevState, soundVolume: value })),
		setDiffEnabled: (value) => setState((prevState) => ({ ...prevState, diffEnabled: value })),
		setBrowserViewportSize: (value) => setState((prevState) => ({ ...prevState, browserViewportSize: value })),
		setFuzzyMatchThreshold: (value) => setState((prevState) => ({ ...prevState, fuzzyMatchThreshold: value })),
		setPreferredLanguage: (value) => setState((prevState) => ({ ...prevState, preferredLanguage: value })),
		setWriteDelayMs: (value) => setState((prevState) => ({ ...prevState, writeDelayMs: value })),
		setScreenshotQuality: (value) => setState((prevState) => ({ ...prevState, screenshotQuality: value })),
		setTerminalOutputLineLimit: (value) =>
			setState((prevState) => ({ ...prevState, terminalOutputLineLimit: value })),
		setMcpEnabled: (value) => setState((prevState) => ({ ...prevState, mcpEnabled: value })),
		setAlwaysApproveResubmit: (value) => setState((prevState) => ({ ...prevState, alwaysApproveResubmit: value })),
		setRequestDelaySeconds: (value) => setState((prevState) => ({ ...prevState, requestDelaySeconds: value })),
		setCurrentApiConfigName: (value) => setState((prevState) => ({ ...prevState, currentApiConfigName: value })),
		setListApiConfigMeta: (value) => setState((prevState) => ({ ...prevState, listApiConfigMeta: value })),
		onUpdateApiConfig: (apiConfig) => {
			sendMessage({
				type: "upsertApiConfiguration" as const,
				text: state.currentApiConfigName,
				apiConfiguration: apiConfig,
			})
		},
		setMode: (value) => setState((prevState) => ({ ...prevState, mode: value })),
		setCustomPrompts: (value) => setState((prevState) => ({ ...prevState, customPrompts: value })),
		setEnhancementApiConfigId: (value) =>
			setState((prevState) => ({ ...prevState, enhancementApiConfigId: value })),
		setExperimentalDiffStrategy: (value) =>
			setState((prevState) => ({ ...prevState, experimentalDiffStrategy: value })),
		setAutoApprovalEnabled: (value) => setState((prevState) => ({ ...prevState, autoApprovalEnabled: value })),
	}

	return <StandaloneStateContext.Provider value={contextValue}>{children}</StandaloneStateContext.Provider>
}

export const useStandaloneState = () => {
	const context = useContext(StandaloneStateContext)
	if (context === undefined) {
		throw new Error("useStandaloneState must be used within a StandaloneStateProvider")
	}
	return context
}
