/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: "#007ACC",
				secondary: "#2D2D30",
				"background-dark": "#1E1E1E",
				"background-light": "#FFFFFF",
				"surface-dark": "#252526",
				"surface-light": "#F3F3F3",
			},
			fontFamily: {
				sans: [
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Roboto",
					"Oxygen",
					"Ubuntu",
					"Cantarell",
					"Open Sans",
					"Helvetica Neue",
					"sans-serif",
				],
			},
		},
	},
	plugins: [],
}
