// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export const getSupabase = (): SupabaseClient | null => {
  // Only run on client side
  if (typeof window === 'undefined') return null

  // Get env vars at runtime (not at module load time)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Don't create client if credentials are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

// Export for debugging
export const debugSupabase = () => ({
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...'
    : 'missing'
})

// Server-side Supabase client (for API routes)
export const getSupabaseServer = (): SupabaseClient | null => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase server credentials')
    return null
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Types for the app
export type UserRole = 'el' | 'ella'
export type GastoTipo = 'propio' | 'compartido'

export interface Gasto {
  id: string
  monto: number
  descripcion: string
  tipo: GastoTipo
  quien: UserRole
  fecha: string
  created_at: string
}