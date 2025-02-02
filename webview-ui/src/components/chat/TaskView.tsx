import { ClineMessage } from "../../../../src/shared/ExtensionMessage"

interface TaskViewProps {
	task: ClineMessage
	onDone: () => void
}

const TaskView = ({ task, onDone }: TaskViewProps) => {
	// ... existing code ...
}

TaskView.displayName = "TaskView"

export default TaskView
