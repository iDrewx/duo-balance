'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { updateUserSetting, getCachedSettings, THEME_KEY } from '@/lib/settings'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Hook para obtener la preferencia real (resuelve 'system')
function useSystemTheme(): boolean {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }
    
    // Initial value
    setIsDark(mediaQuery.matches)
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isDark
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const systemIsDark = useSystemTheme()

  // Cargar tema guardado al inicio
  useEffect(() => {
    setMounted(true)
    
    // Primero intentar desde cache local
    const cached = getCachedSettings()
    if (cached?.theme) {
      setThemeState(cached.theme as Theme)
      setIsLoading(false)
      return
    }
    
    // Luego localStorage
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored) {
      setThemeState(stored)
    }
    // Default: system (ya está por defecto)
    setIsLoading(false)
  }, [])

  // Determinar si es modo oscuro实际的
  const isDark = theme === 'system' ? systemIsDark : theme === 'dark'

  // Aplicar clase al document cuando cambia
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(isDark ? 'dark' : 'light')
      localStorage.setItem(THEME_KEY, theme)
    }
  }, [theme, isDark, mounted])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    
    // Guardar en Supabase (async, no bloquea UI)
    await updateUserSetting('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, isLoading }}>
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
