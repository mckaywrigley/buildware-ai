"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { FC } from "react"
import { Button } from "../ui/button"

interface ThemeSwitcherProps {}

export const ThemeSwitcher: FC<ThemeSwitcherProps> = () => {
  const { setTheme, theme } = useTheme()

  const handleChange = (theme: "dark" | "light") => {
    localStorage.setItem("theme", theme)
    setTheme(theme)
  }

  return (
    <Button
      className="flex cursor-pointer space-x-2"
      variant="ghost"
      size="icon"
      onClick={() => handleChange(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  )
}
