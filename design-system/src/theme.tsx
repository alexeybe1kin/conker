import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Theme = "light" | "dark"
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null)

/** One root provider also themes Radix portals appended to the document body. */
export function ThemeProvider({ children, initialTheme = "light" }: { children: ReactNode; initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  useLayoutEffect(() => {
    const root = document.documentElement
    const previous = root.classList.contains("dark")
    root.classList.toggle("dark", theme === "dark")
    return () => { root.classList.toggle("dark", previous) }
  }, [theme])
  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("Wrap the interface in ThemeProvider before using theme controls.")
  return context
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const Icon = theme === "dark" ? Sun : Moon
  return <Button variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
    <Icon data-icon="inline-start" aria-hidden="true" />{theme === "dark" ? "Use light theme" : "Use dark theme"}
  </Button>
}
