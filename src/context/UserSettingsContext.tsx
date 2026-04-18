'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getUserSettings, getCachedSettings, cacheSettingsInLocal, updateUserSettings, UserSettings, DEFAULT_SETTINGS } from '@/lib/settings'

interface UserSettingsContextType {
  settings: UserSettings | null
  isLoading: boolean
  updateSettings: (updates: Partial<UserSettings>) => Promise<boolean>
  refetch: () => Promise<void>
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSettings = async () => {
    setIsLoading(true)
    
    // 1. Primero cargar desde cache local (más rápido)
    const cached = getCachedSettings()
    if (cached) {
      setSettings(cached)
    }
    
    // 2. Luego intentar desde Supabase
    try {
      const supabaseSettings = await getUserSettings()
      if (supabaseSettings) {
        setSettings(supabaseSettings)
        cacheSettingsInLocal(supabaseSettings)
      } else if (!cached) {
        // Si no hay cache ni settings de Supabase, usar defaults
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      if (!cached) {
        setSettings(DEFAULT_SETTINGS)
      }
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const updateSettings = async (updates: Partial<UserSettings>): Promise<boolean> => {
    // Actualizar local state inmediatamente (optimistic update)
    if (settings) {
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)
      cacheSettingsInLocal(newSettings)
    }
    
    // Guardar en Supabase
    const success = await updateUserSettings(updates)
    if (!success) {
      // Si falla, recargar desde Supabase
      await loadSettings()
      return false
    }
    
    return true
  }

  return (
    <UserSettingsContext.Provider value={{ settings, isLoading, updateSettings, refetch: loadSettings }}>
      {children}
    </UserSettingsContext.Provider>
  )
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext)
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider')
  }
  return context
}

// Helper functions para obtener valores con defaults
export function useProfileNames() {
  const { settings } = useUserSettings()
  return {
    nombreEl: settings?.nombre_el || 'André',
    nombreElla: settings?.nombre_ella || 'Diana',
    avatarEl: settings?.avatar_el || '👨',
    avatarElla: settings?.avatar_ella || '👩',
    assignedProfile: settings?.assigned_profile || null
  }
}