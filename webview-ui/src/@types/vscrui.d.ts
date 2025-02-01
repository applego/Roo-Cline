declare module "vscrui" {
	export interface DropdownOption {
		value: string
		label: string
	}

	export interface DropdownProps {
		id?: string
		value?: string
		onChange?: (value: unknown) => void
		style?: React.CSSProperties
		options?: DropdownOption[]
		children?: React.ReactNode
	}

	export interface CheckboxProps {
		checked?: boolean
		onChange?: (checked: boolean) => void
		children?: React.ReactNode
		style?: React.CSSProperties
	}

	export const Checkbox: React.FC<CheckboxProps>
	export const Dropdown: React.FC<DropdownProps>
}
