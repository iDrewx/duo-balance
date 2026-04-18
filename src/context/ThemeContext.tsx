'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { updateUserSetting, getCachedSettings, THEME_KEY } from '@/lib/settings'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar tema guardado al inicio
  useEffect(() => {
    setMounted(true)
    
    // Primero intentar desde cache local
    const cached = getCachedSettings()
    if (cached?.theme) {
      setTheme(cached.theme as Theme)
      setIsLoading(false)
      return
    }
    
    // Luego localStorage
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored) {
      setTheme(stored)
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    setIsLoading(false)
  }, [])

  // Aplicar clase al document cuando cambia el tema
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
      localStorage.setItem(THEME_KEY, theme)
    }
  }, [theme, mounted])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Guardar en Supabase (async, no bloquea UI)
    await updateUserSetting('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}