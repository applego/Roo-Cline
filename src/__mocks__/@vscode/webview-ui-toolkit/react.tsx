import React, { ChangeEvent } from "react"

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

interface TextAreaProps {
	value?: string
	onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
	placeholder?: string
	disabled?: boolean
	rows?: number
}

export function TextArea({ value, onChange, placeholder, disabled, rows }: TextAreaProps) {
	return <textarea value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} rows={rows} />
}

interface DropdownProps {
	value?: string
	onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
	disabled?: boolean
	children?: React.ReactNode
}

export function Dropdown({ value, onChange, disabled, children }: DropdownProps) {
	return (
		<select value={value} onChange={onChange} disabled={disabled}>
			{children}
		</select>
	)
}

export const VSCodeOption: React.FC<{
	value: string
	children?: React.ReactNode
}> = ({ value, children }) => <option value={value}>{children}</option>

interface CheckboxProps {
	checked?: boolean
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void
	disabled?: boolean
	children?: React.ReactNode
}

export function Checkbox({ checked, onChange, disabled, children }: CheckboxProps) {
	return (
		<label>
			<input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
			{children}
		</label>
	)
}
