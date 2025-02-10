import React, { useState, useEffect } from "react"
import { Chat } from "./components/chat/Chat"
import { Theme } from "./components/theme/Theme"
import { VSCodeChatAdapter } from "./platforms/vscode/chat/VSCodeChatAdapter"
// import { WebChatAdapter, createWebChatAdapter } from "./platforms/web/chat/WebChatAdapter"
import { createWebChatAdapter } from "./platforms/web/chat/WebChatAdapter"
import { isVSCodeEnvironment } from "./utils/environment"
import "./App.css"
import { ChatAdapter } from "./core/chat/ChatCore"
import { StandaloneStateProvider } from "./context/StandaloneStateContext"

export interface ChatProps {
	chatAdapter: ChatAdapter
}

function App() {
	const [chatAdapter, setChatAdapter] = useState<ChatAdapter | null>(null)

	useEffect(() => {
		if (isVSCodeEnvironment()) {
			// VS Code環境
			setChatAdapter(new VSCodeChatAdapter())
		} else {
			// Web環境
			const webChatAdapter = createWebChatAdapter()
			setChatAdapter(webChatAdapter)
		}
	}, [])

	return (
		<div className="App">
			<Theme>
				<StandaloneStateProvider>
					{chatAdapter && <Chat chatAdapter={chatAdapter} key={chatAdapter.constructor.name} />}
				</StandaloneStateProvider>
			</Theme>
		</div>
	)
}

export default App
