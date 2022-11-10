import { createContext } from "react"

const SettingsContext = createContext({
    theme: window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light",
    fontSize: 'small'
})

export { SettingsContext }