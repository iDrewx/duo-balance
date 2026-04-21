'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getUserSettings, getCachedSettings, cacheSettingsInLocal, updateUserSettings, UserSettings, DEFAULT_SETTINGS, createUserSettingsIfNotExist } from '@/lib/settings'
import { getSupabase } from '@/lib/supabase'

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
      let supabaseSettings = await getUserSettings()

      // Si no hay settings en Supabase, crear iniciales con seeds determinísticas
      if (!supabaseSettings) {
        supabaseSettings = await createUserSettingsIfNotExist()
      }

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

  // Suscribirse a cambios en tiempo real de user_settings
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    // Suscribirse a cambios en la tabla user_settings (ya no filtra por user_id)
    const channel = supabase
      .channel('user-settings-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_settings'
      }, (payload) => {
        const updatedSettings = payload.new as UserSettings
        setSettings(updatedSettings)
        cacheSettingsInLocal(updatedSettings)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
    avatarElSeed: settings?.avatar_el_seed || 'default-el',
    avatarEllaSeed: settings?.avatar_ella_seed || 'default-ella',
    assignedProfile: settings?.assigned_profile || null
  }
}