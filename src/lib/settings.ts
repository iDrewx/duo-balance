import { getSupabase } from './supabase'
import { UserRole } from '@/types'

// Couple ID hardcoded - shared by both André and Diana
const COUPLE_ID = 'duo-balance-main'

export interface UserSettings {
  couple_id: string
  nombre_el: string
  nombre_ella: string
  avatar_el: string
  avatar_ella: string
  avatar_el_seed: string
  avatar_ella_seed: string
  assigned_profile: UserRole | null
  theme: 'light' | 'dark' | 'system'
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('couple_id', COUPLE_ID)
    .single()

  if (error || !data) {
    console.log('No settings found, will use defaults')
    return null
  }

  return {
    couple_id: data.couple_id,
    nombre_el: data.nombre_el || 'André',
    nombre_ella: data.nombre_ella || 'Diana',
    avatar_el: data.avatar_el || '👨',
    avatar_ella: data.avatar_ella || '👩',
    avatar_el_seed: data.avatar_el_seed || `seed-${COUPLE_ID}-el`,
    avatar_ella_seed: data.avatar_ella_seed || `seed-${COUPLE_ID}-ella`,
    assigned_profile: data.assigned_profile as UserRole | null,
    theme: (data.theme || 'system') as 'light' | 'dark' | 'system'
  }
}

/**
 * Crea settings iniciales para la pareja con seeds compartidas basadas en couple_id
 */
export async function createUserSettingsIfNotExist(): Promise<UserSettings | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  // Verificar si ya existen settings
  const { data: existing } = await supabase
    .from('user_settings')
    .select('*')
    .eq('couple_id', COUPLE_ID)
    .single()

  if (existing) {
    return getUserSettings()
  }

  // Seeds determinísticas basadas en couple_id - mismo seed en todos los dispositivos
  const avatarElSeed = `seed-${COUPLE_ID}-el`
  const avatarEllaSeed = `seed-${COUPLE_ID}-ella`

  const { data, error } = await supabase
    .from('user_settings')
    .insert([{
      couple_id: COUPLE_ID,
      nombre_el: 'André',
      nombre_ella: 'Diana',
      avatar_el_seed: avatarElSeed,
      avatar_ella_seed: avatarEllaSeed,
      assigned_profile: null,
      theme: 'system'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating user settings:', error)
    return null
  }

  return {
    couple_id: data.couple_id,
    nombre_el: data.nombre_el,
    nombre_ella: data.nombre_ella,
    avatar_el: data.avatar_el || '👨',
    avatar_ella: data.avatar_ella || '👩',
    avatar_el_seed: data.avatar_el_seed,
    avatar_ella_seed: data.avatar_ella_seed,
    assigned_profile: data.assigned_profile as UserRole | null,
    theme: (data.theme || 'system') as 'light' | 'dark' | 'system'
  }
}

export async function updateUserSettings(updates: Partial<UserSettings>): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase
    .from('user_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('couple_id', COUPLE_ID)

  if (error) {
    console.error('Error updating settings:', error)
    return false
  }

  return true
}

export async function updateUserSetting(key: keyof UserSettings, value: any): Promise<boolean> {
  return updateUserSettings({ [key]: value })
}

// Guardar en localStorage como backup/cache
const LOCAL_SETTINGS_KEY = 'duobalance-settings-cache'

export function cacheSettingsInLocal(settings: UserSettings) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings))
}

export function getCachedSettings(): UserSettings | null {
  const cached = localStorage.getItem(LOCAL_SETTINGS_KEY)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {
      return null
    }
  }
  return null
}

// Keys locales para fallback
export const NOMBRE_KEY = 'duobalance-nombre'
export const AVATAR_KEY = 'duobalance-avatar'
export const ASSIGNED_PROFILE_KEY = 'duobalance-assigned-profile'
export const THEME_KEY = 'duobalance-theme'

// Valores por defecto
export const DEFAULT_SETTINGS: UserSettings = {
  couple_id: COUPLE_ID,
  nombre_el: 'André',
  nombre_ella: 'Diana',
  avatar_el: '👨',
  avatar_ella: '👩',
  avatar_el_seed: `seed-${COUPLE_ID}-el`,
  avatar_ella_seed: `seed-${COUPLE_ID}-ella`,
  assigned_profile: null,
  theme: 'system'
}