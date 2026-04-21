'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getUserSettings, getCachedSettings, cacheSettingsInLocal, updateUserSettings, UserSettings, DEFAULT_SETTINGS, createUserSettingsIfNotExist } from '@/lib/settings'
import { getSupabase } from '@/lib/supabase'

interface UserSettingsContextType {
  settings: UserSettings | null
  isLoading: boolean
  updateSettings: (updates: Partial<UserSettings>) => Promise<boolean>
  refetch: () => Promise<UserSettings | null | void>
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar settings desde Supabase (sin tocar isLoading para evitar carreras)
  const loadSettingsFromSupabase = async () => {
    try {
      let supabaseSettings = await getUserSettings()

      // Si no hay settings en Supabase, crear iniciales con seeds determinísticas
      if (!supabaseSettings) {
        supabaseSettings = await createUserSettingsIfNotExist()
      }

      if (supabaseSettings) {
        setSettings(supabaseSettings)
        cacheSettingsInLocal(supabaseSettings)
        return supabaseSettings
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
    return null
  }

  // Cargar settings iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    const supabase = getSupabase()

    const initSettings = async () => {
      // 1. Primero cargar desde cache local (más rápido)
      const cached = getCachedSettings()
      if (cached) {
        setSettings(cached)
      }

      // 2. Luego intentar desde Supabase y actualizar si hay datos frescos
      const supabaseSettings = await loadSettingsFromSupabase()
      if (!supabaseSettings && !cached) {
        setSettings(DEFAULT_SETTINGS)
      }

      setIsLoading(false)
    }

    initSettings()

    // Suscribirse a cambios en tiempo real de user_settings
    if (supabase) {
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
    } else {
      setIsLoading(false)
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
      await loadSettingsFromSupabase()
      return false
    }

    return true
  }

  return (
    <UserSettingsContext.Provider value={{ settings, isLoading, updateSettings, refetch: loadSettingsFromSupabase }}>
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