import { createContext } from "react"

const ThemeContext = createContext(window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light")

export { ThemeContext }