interface ChatInputProps {
	onSubmit: (message: string) => void
	isLoading: boolean
	isWaitingForInput: boolean
}

const ChatInput = ({ onSubmit, isLoading, isWaitingForInput }: ChatInputProps) => {
	// ... existing code ...
}

ChatInput.displayName = "ChatInput"

export default ChatInput
