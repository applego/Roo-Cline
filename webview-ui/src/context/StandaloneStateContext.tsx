import React, { createContext, useContext, useReducer, useEffect } from "react"
import { isStandaloneWeb } from "../utils/environment"

interface State {
	messages: any[]
	theme: "light" | "dark" | "high-contrast"
	settings: {
		fontSize: string
		fontFamily: string
		[key: string]: any
	}
}

interface Action {
	type: string
	payload?: any
}

const initialState: State = {
	messages: [],
	theme: "dark",
	settings: {
		fontSize: "14px",
		fontFamily: "monospace",
	},
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "ADD_MESSAGE":
			return {
				...state,
				messages: [...state.messages, action.payload],
			}
		case "SET_THEME":
			return {
				...state,
				theme: action.payload,
			}
		case "UPDATE_SETTINGS":
			return {
				...state,
				settings: {
					...state.settings,
					...action.payload,
				},
			}
		case "CLEAR_MESSAGES":
			return {
				...state,
				messages: [],
			}
		default:
			return state
	}
}

interface StandaloneStateContextType {
	state: State
	dispatch: React.Dispatch<Action>
}

const StandaloneStateContext = createContext<StandaloneStateContextType | undefined>(undefined)

export function StandaloneStateProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState)

	// LocalStorageから状態を復元
	useEffect(() => {
		if (isStandaloneWeb()) {
			const savedState = localStorage.getItem("standaloneState")
			if (savedState) {
				try {
					const parsedState = JSON.parse(savedState)
					Object.entries(parsedState).forEach(([key, value]) => {
						dispatch({ type: `SET_${key.toUpperCase()}`, payload: value })
					})
				} catch (error) {
					console.error("Failed to parse saved state:", error)
				}
			}
		}
	}, [])

	// 状態の変更をLocalStorageに保存
	useEffect(() => {
		if (isStandaloneWeb()) {
			localStorage.setItem("standaloneState", JSON.stringify(state))
		}
	}, [state])

	return <StandaloneStateContext.Provider value={{ state, dispatch }}>{children}</StandaloneStateContext.Provider>
}

export function useStandaloneState() {
	const context = useContext(StandaloneStateContext)
	if (context === undefined) {
		throw new Error("useStandaloneState must be used within a StandaloneStateProvider")
	}
	return context
}

// 便利なフック
export function useMessages() {
	const { state, dispatch } = useStandaloneState()
	return {
		messages: state.messages,
		addMessage: (message: any) => dispatch({ type: "ADD_MESSAGE", payload: message }),
		clearMessages: () => dispatch({ type: "CLEAR_MESSAGES" }),
	}
}

export function useTheme() {
	const { state, dispatch } = useStandaloneState()
	return {
		theme: state.theme,
		setTheme: (theme: "light" | "dark" | "high-contrast") => dispatch({ type: "SET_THEME", payload: theme }),
	}
}

export function useSettings() {
	const { state, dispatch } = useStandaloneState()
	return {
		settings: state.settings,
		updateSettings: (newSettings: Partial<State["settings"]>) =>
			dispatch({ type: "UPDATE_SETTINGS", payload: newSettings }),
	}
}
