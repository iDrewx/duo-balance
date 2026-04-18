// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export const getSupabase = (): SupabaseClient | null => {
  // Only run on client side
  if (typeof window === 'undefined') return null

  // Get env vars at runtime (not at module load time)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Debug log
  console.log('🔍 Supabase check:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? supabaseUrl.substring(0, 40) + '...' : 'missing'
  })

  // Don't create client if credentials are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (!supabase) {
    console.log('✅ Creating Supabase client')
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