import React from "react"

export const VSCodeButton: React.FC<{
	appearance?: "primary" | "secondary"
	onClick?: () => void
	disabled?: boolean
	children?: React.ReactNode
}> = ({ children, onClick, disabled }) => (
	<button onClick={onClick} disabled={disabled}>
		{children}
	</button>
)

export const VSCodeTextArea: React.FC<{
	value?: string
	onChange?: (event: { target: { value: string } }) => void
	placeholder?: string
	disabled?: boolean
	rows?: number
}> = ({ value, onChange, placeholder, disabled, rows }) => (
	<textarea value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} rows={rows} />
)

export const VSCodeDropdown: React.FC<{
	value?: string
	onChange?: (event: { target: { value: string } }) => void
	disabled?: boolean
	children?: React.ReactNode
}> = ({ value, onChange, disabled, children }) => (
	<select value={value} onChange={onChange} disabled={disabled}>
		{children}
	</select>
)

export const VSCodeOption: React.FC<{
	value: string
	children?: React.ReactNode
}> = ({ value, children }) => <option value={value}>{children}</option>

export const VSCodeCheckbox: React.FC<{
	checked?: boolean
	onChange?: (event: { target: { checked: boolean } }) => void
	disabled?: boolean
	children?: React.ReactNode
}> = ({ checked, onChange, disabled, children }) => (
	<label>
		<input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
		{children}
	</label>
)
