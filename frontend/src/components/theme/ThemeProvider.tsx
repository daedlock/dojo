import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemePalette = 'amethyst' | 'everforest'
export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  palette: ThemePalette
  mode: ThemeMode
  setPalette: (palette: ThemePalette) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'dojo-ui-theme'
}: {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  storageKey?: string
}) {
  const [palette, setPalette] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('theme-palette')
    return (saved as ThemePalette) || 'amethyst'
  })

  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(storageKey)
    return (saved as ThemeMode) || defaultTheme
  })

  const toggleMode = () => {
    if (mode === 'system') {
      setMode('light')
    } else if (mode === 'light') {
      setMode('dark')
    } else {
      setMode('system')
    }
  }

  useEffect(() => {
    localStorage.setItem('theme-palette', palette)
  }, [palette])

  useEffect(() => {
    localStorage.setItem(storageKey, mode)
  }, [mode, storageKey])

  useEffect(() => {
    const root = document.documentElement

    // Remove all theme classes
    root.classList.remove('theme-amethyst', 'theme-everforest', 'light', 'dark')

    // Apply palette theme
    if (palette === 'everforest') {
      root.classList.add('theme-everforest')
    }

    // Apply mode
    let resolvedMode = mode
    if (mode === 'system') {
      resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    if (resolvedMode === 'dark') {
      root.classList.add('dark')
    }
  }, [palette, mode])

  return (
    <ThemeContext.Provider value={{ palette, mode, setPalette, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}