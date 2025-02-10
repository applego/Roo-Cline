import React, { useState, useEffect, useRef } from "react"
import "./Chat.css"
import { ChatMessage } from "../../core/chat/types"
import { useTheme } from "../../context/StandaloneStateContext"
import { VSCodeThemeAdapter } from "../../platforms/vscode/theme/VSCodeThemeAdapter"
import { WebThemeAdapter } from "../../platforms/web/theme/WebThemeAdapter"
import { isVSCodeEnvironment } from "../../utils/environment"
import { ChatAdapter } from "../../core/chat/ChatCore"

interface ChatProps {
	chatAdapter: ChatAdapter
}

export const Chat: React.FC<ChatProps> = ({ chatAdapter }) => {
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [newMessage, setNewMessage] = useState("")
	const chatContainerRef = useRef<HTMLDivElement>(null)
	useTheme()

	useEffect(() => {
		// チャットアダプターが利用可能な場合に接続
		if (chatAdapter) {
			chatAdapter.connect()

			// メッセージ受信時の処理
			chatAdapter.onReceiveMessage((message: ChatMessage) => {
				setMessages((prevMessages) => [...prevMessages, message])
			})
		}

		// コンポーネントのアンマウント時に切断
		return () => {
			chatAdapter?.disconnect()
		}
	}, [chatAdapter])

	useEffect(() => {
		// 新しいメッセージが追加されたときにチャットコンテナをスクロール
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
		}
	}, [messages])

	const handleSendMessage = () => {
		if (newMessage.trim() !== "") {
			const message: ChatMessage = {
				content: newMessage,
				timestamp: new Date().toISOString(),
			}
			chatAdapter?.sendMessage(message)
			setNewMessage("")
		}
	}

	return (
		<div className="chat-container">
			<div className="chat-header">
				<h2>Chat</h2>
			</div>
			<div className="chat-messages" ref={chatContainerRef}>
				{messages.map((message, index) => (
					<div key={index} className="message">
						{message.content}
					</div>
				))}
			</div>
			<div className="chat-input">
				<input
					type="text"
					placeholder="Enter your message..."
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
				/>
				<button onClick={handleSendMessage}>Send</button>
			</div>
		</div>
	)
}
