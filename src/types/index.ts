export type UserRole = 'el' | 'ella'

export type GastoTipo = 'propio' | 'compartido'

export interface UserProfile {
  role: UserRole
  nombre: string
  avatar?: string
}

export interface User {
  id: string
  email: string
  nombre: string
  role: UserRole
}

export interface Gasto {
  id: string
  monto: number
  descripcion: string
  tipo: GastoTipo
  quien: UserRole
  fecha: string
  // created_at puede no existir en la DB (generado por Supabase automáticamente)
  created_at?: string
  // Mes del corte al que pertenece (formato: YYYY-MM)
  corte?: string
}

export interface Resumen {
  totalGastos: number
  totalCompartido: number
  propiosEl: number
  propiosElla: number
  mitadCompartido: number
  debeEl: number
  debeElla: number
}

export interface Corte {
  id: string // YYYY-MM
  label: string // "Enero 2025", "Febrero 2025", etc.
  gastos: Gasto[]
  resumen: Resumen
}

// DiceBear Avatar URLs
export const DICE_BEAR_BASE_URL = 'https://api.dicebear.com/9.x/bottts-neutral/svg'
export const DICE_BEAR_VERSION = '9.x'