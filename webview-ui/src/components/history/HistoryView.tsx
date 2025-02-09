import { VSCodeButton, VSCodeTextField, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import { Virtuoso } from "react-virtuoso"
import React, { memo, useMemo, useState, useEffect } from "react"
import { Fzf } from "fzf"
import { formatLargeNumber } from "../../utils/format"
import { highlightFzfMatch } from "../../utils/highlight"
import { AutoSizer, List } from "react-virtualized"

type HistoryViewProps = {
	onDone: () => void
}

type SortOption = "newest" | "oldest" | "mostExpensive" | "mostTokens" | "mostRelevant"

const getItemHeight = () => 150 // 固定の高さを返す関数

const HistoryView = ({ onDone }: HistoryViewProps) => {
	const { taskHistory, setTaskHistory } = useExtensionState()
	const [searchQuery, setSearchQuery] = useState("")
	const [sortOption, setSortOption] = useState<SortOption>("newest")
	const [lastNonRelevantSort, setLastNonRelevantSort] = useState<SortOption | null>("newest")
	const [showCopyModal, setShowCopyModal] = useState(false)
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [dialogContent, setDialogContent] = useState("")
	const [dialogTitle, setDialogTitle] = useState("")

	useEffect(() => {
		if (searchQuery && sortOption !== "mostRelevant" && !lastNonRelevantSort) {
			setLastNonRelevantSort(sortOption)
			setSortOption("mostRelevant")
		} else if (!searchQuery && sortOption === "mostRelevant" && lastNonRelevantSort) {
			setSortOption(lastNonRelevantSort)
			setLastNonRelevantSort(null)
		}
	}, [searchQuery, sortOption, lastNonRelevantSort])

	const handleHistorySelect = (id: string) => {
		setSelectedItemId(id)
	}

	const handleDeleteHistoryItem = (id: string) => {
		vscode.postMessage({ type: "deleteTaskWithId", text: id })
	}

	const handleCopyTask = async (e: React.MouseEvent, task: string) => {
		e.stopPropagation()
		try {
			await navigator.clipboard.writeText(task)
			setShowCopyModal(true)
			setTimeout(() => setShowCopyModal(false), 2000)
		} catch (error) {
			console.error("Failed to copy to clipboard:", error)
		}
	}

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp)
		return date
			?.toLocaleString("en-US", {
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			})
			.replace(", ", " ")
			.replace(" at", ",")
			.toUpperCase()
	}

	const presentableTasks = useMemo(() => {
		return taskHistory.filter((item) => item.ts && item.task)
	}, [taskHistory])

	const fzf = useMemo(() => {
		return new Fzf(presentableTasks, {
			selector: (item) => item.task,
		})
	}, [presentableTasks])

	const taskHistorySearchResults = useMemo(() => {
		let results = presentableTasks
		if (searchQuery) {
			const searchResults = fzf.find(searchQuery)
			results = searchResults.map((result) => ({
				...result.item,
				task: highlightFzfMatch(result.item.task, Array.from(result.positions)),
			}))
		}

		// First apply search if needed
		const searchResults = searchQuery ? results : presentableTasks

		// Then sort the results
		return [...searchResults].sort((a, b) => {
			switch (sortOption) {
				case "oldest":
					return (a.ts || 0) - (b.ts || 0)
				case "mostExpensive":
					return (b.totalCost || 0) - (a.totalCost || 0)
				case "mostTokens":
					const aTokens = (a.tokensIn || 0) + (a.tokensOut || 0) + (a.cacheWrites || 0) + (a.cacheReads || 0)
					const bTokens = (b.tokensIn || 0) + (b.tokensOut || 0) + (b.cacheWrites || 0) + (b.cacheReads || 0)
					return bTokens - aTokens
				case "mostRelevant":
					// Keep fuse order if searching, otherwise sort by newest
					return searchQuery ? 0 : (b.ts || 0) - (a.ts || 0)
				case "newest":
				default:
					return (b.ts || 0) - (a.ts || 0)
			}
		})
	}, [presentableTasks, searchQuery, fzf, sortOption])

	return (
		<>
			<style>
				{`
					.history-item:hover {
						background-color: var(--vscode-list-hoverBackground);
					}
					.delete-button, .export-button, .copy-button {
						opacity: 0;
						pointer-events: none;
					}
					.history-item:hover .delete-button,
					.history-item:hover .export-button,
					.history-item:hover .copy-button {
						opacity: 1;
						pointer-events: auto;
					}
					.history-item-highlight {
						background-color: var(--vscode-editor-findMatchHighlightBackground);
						color: inherit;
					}
					.copy-modal {
						position: fixed;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						background-color: var(--vscode-notifications-background);
						color: var(--vscode-notifications-foreground);
						padding: 12px 20px;
						border-radius: 4px;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
						z-index: 1000;
						transition: opacity 0.2s ease-in-out;
					}
				`}
			</style>
			{showCopyModal && <div className="copy-modal">Prompt Copied to Clipboard</div>}
			<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
				<div style={{ padding: "20px 20px 0 20px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
						<VSCodeButton appearance="icon" onClick={onDone}>
							<span className="codicon codicon-chevron-left"></span>
						</VSCodeButton>
						<h2 style={{ margin: 0 }}>History</h2>
					</div>
				</div>

				<div style={{ flex: 1, overflowY: "auto", paddingBottom: "20px" }}>
					<AutoSizer>
						{({ height, width }: { height: number; width: number }) => (
							<List height={height} itemCount={taskHistory.length} itemSize={getItemHeight} width={width}>
								{({ index, style }: { index: number; style: React.CSSProperties }) => {
									const item = taskHistory[index]
									return (
										<div
											key={item.id}
											style={{
												...style,
												padding: "0 20px",
											}}>
											<div
												className="history-item"
												onClick={() => handleHistorySelect(item.id)}
												style={{
													padding: "12px",
													cursor: "pointer",
													borderRadius: "4px",
													backgroundColor:
														selectedItemId === item.id
															? "var(--vscode-list-activeSelectionBackground)"
															: undefined,
													color:
														selectedItemId === item.id
															? "var(--vscode-list-activeSelectionForeground)"
															: undefined,
												}}>
												<div style={{ marginBottom: "8px" }}>
													<span
														style={{
															color:
																selectedItemId === item.id
																	? "var(--vscode-list-activeSelectionForeground)"
																	: "var(--vscode-descriptionForeground)",
															fontWeight: 500,
															fontSize: "0.85em",
															textTransform: "uppercase",
														}}>
														{formatDate(item.ts)}
													</span>
												</div>
												<div
													style={{
														fontSize: "var(--vscode-font-size)",
														color:
															selectedItemId === item.id
																? "var(--vscode-list-activeSelectionForeground)"
																: "var(--vscode-descriptionForeground)",
														marginBottom: "8px",
														whiteSpace: "pre-wrap",
														wordBreak: "break-word",
														overflowWrap: "anywhere",
													}}>
													{item.task}
												</div>
												<div
													style={{
														fontSize: "0.85em",
														color:
															selectedItemId === item.id
																? "var(--vscode-list-activeSelectionForeground)"
																: "var(--vscode-descriptionForeground)",
													}}>
													<span>
														Tokens: ↑{formatLargeNumber(item.tokensIn || 0)} ↓
														{formatLargeNumber(item.tokensOut || 0)}
													</span>
													{!!item.cacheWrites && (
														<>
															{" • "}
															<span>
																Cache: +{formatLargeNumber(item.cacheWrites || 0)} →{" "}
																{formatLargeNumber(item.cacheReads || 0)}
															</span>
														</>
													)}
													{!!item.totalCost && (
														<>
															{" • "}
															<span>API Cost: ${item.totalCost?.toFixed(4)}</span>
														</>
													)}
												</div>
											</div>
										</div>
									)
								}}
							</List>
						)}
					</AutoSizer>
				</div>
			</div>
		</>
	)
}

HistoryView.displayName = "HistoryView"

const ExportButton = ({ itemId }: { itemId: string }) => (
	<VSCodeButton
		className="export-button"
		appearance="icon"
		onClick={(e) => {
			e.stopPropagation()
			vscode.postMessage({ type: "exportTaskWithId", text: itemId })
		}}>
		<div style={{ fontSize: "11px", fontWeight: 500, opacity: 1 }}>EXPORT</div>
	</VSCodeButton>
)

export default memo(HistoryView)
