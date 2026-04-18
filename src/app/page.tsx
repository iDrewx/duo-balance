'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import UserSelector from '@/components/UserSelector'
import GastoForm from '@/components/GastoForm'
import GastoList from '@/components/GastoList'
import Resumen from '@/components/Resumen'
import Historial from '@/components/Historial'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'
import { Gasto, GastoTipo, UserRole } from '@/types'
import { getSupabase } from '@/lib/supabase'

// Storage key for local fallback
const STORAGE_KEY = 'gastos-compartidos-data'

export default function Home() {
  const router = useRouter()
  const { user: authUser, isLoading: authLoading, signOut } = useAuth()
  const { isDark } = useTheme()
  const { settings, isLoading: settingsLoading } = useUserSettings()
  
  const [user, setUser] = useState<UserRole | null>(null)
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isClient, setIsClient] = useState(false)
  const [vista, setVista] = useState<'resumen' | 'historial'>('resumen')
  const [isLoading, setIsLoading] = useState(true)

  // Cargar perfil asignado automáticamente al iniciar
  useEffect(() => {
    if (isClient && settings && !settingsLoading) {
      if (settings.assigned_profile) {
        setUser(settings.assigned_profile)
      }
    }
  }, [isClient, settings, settingsLoading])

  // Verificar auth antes de mostrar la app
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login')
    }
  }, [authUser, authLoading, router])

  // Cargar gastos al inicio
  useEffect(() => {
    setIsClient(true)
    const loadData = async () => {
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('gastos')
            .select('*')

          if (error) {
            console.error('Error fetching gastos:', error)
            loadLocalGastos()
          } else if (data) {
            console.log('Gastos from DB:', data)
            setGastos(data)
          }
        } catch (err) {
          console.error('Error:', err)
          loadLocalGastos()
        } finally {
          setIsLoading(false)
        }
      } else {
        loadLocalGastos()
      }
    }
    loadData()
  }, [])

  const loadLocalGastos = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setGastos(JSON.parse(stored))
      } catch (e) {
        console.error('Error parsing local data:', e)
      }
    }
    setIsLoading(false)
  }

  const saveLocalGastos = (data: Gasto[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const handleAgregarGasto = useCallback(async (monto: number, descripcion: string, tipo: GastoTipo) => {
    if (!user) return
    
    const nuevoGasto: Gasto = {
      id: crypto.randomUUID(),
      monto,
      descripcion,
      tipo,
      quien: user,
      fecha: new Date().toISOString(),
    }

    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('gastos')
          .insert([{
            monto,
            descripcion,
            tipo,
            quien: user,
            fecha: nuevoGasto.fecha
          }])
          .select()

        if (error) {
          console.error('Error inserting gasto:', error)
        } else if (data) {
          setGastos(prev => [data[0], ...prev])
        }
      } catch (err) {
        console.error('Error:', err)
      }
    } else {
      // LocalStorage fallback
      setGastos(prev => {
        const updated = [nuevoGasto, ...prev]
        saveLocalGastos(updated)
        return updated
      })
    }
  }, [user])

  const handleCambiarUsuario = () => {
    if (!settings?.assigned_profile) {
      setUser(null)
    }
  }

  const handleLimpiarDatos = async () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los gastos?')) {
      const supabase = getSupabase()
      if (supabase) {
        try {
          await supabase.from('gastos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        } catch (err) {
          console.error('Error:', err)
        }
      }
      setGastos([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const getGastosActuales = useCallback(() => {
    const ahora = new Date()
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
    return gastos.filter(g => new Date(g.fecha) >= hace30Dias)
  }, [gastos])

  // Obtener datos del perfil desde settings
  const getProfileData = (userRole: UserRole) => {
    if (!settings) {
      return userRole === 'el' 
        ? { nombre: 'André', avatar: '👨' }
        : { nombre: 'Diana', avatar: '👩' }
    }
    return userRole === 'el' 
      ? { nombre: settings.nombre_el, avatar: settings.avatar_el }
      : { nombre: settings.nombre_ella, avatar: settings.avatar_ella }
  }

  const assignedProfile = settings?.assigned_profile

  // Si settings no cargan, mostrar loading
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="text-center">
          <div 
            className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: 'transparent' }}
          ></div>
          <p className="text-[var(--on-surface-variant)] font-['Inter',sans-serif]">Cargando...</p>
        </div>
      </div>
    )
  }

  // Solo si NO hay perfil asignado, mostrar el UserSelector para que elija
  if (!user && !assignedProfile) {
    return <UserSelector onSelect={setUser} />
  }

  // Si hay un perfil asignado, forzar ese perfil
  if (!user && assignedProfile) {
    setUser(assignedProfile)
    return null
  }

  // TypeScript cast para asegurar que user no es null
  const currentUser = user as UserRole
  const profileData = getProfileData(currentUser)

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="text-center">
          <div 
            className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: 'transparent' }}
          ></div>
          <p className="text-[var(--on-surface-variant)] font-['Inter',sans-serif]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header 
        className="bg-[var(--surface-container-lowest)] sticky top-0 z-10"
        style={{ 
          boxShadow: '0 4px 20px rgba(26, 28, 28, 0.04)'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ 
                background: user === 'el' 
                  ? 'var(--secondary-container)' 
                  : 'var(--tertiary-container)'
              }}
            >
              {profileData.avatar}
            </div>
            <div>
              <h1 
                className="text-lg font-bold"
                style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
              >
                {profileData.nombre}
              </h1>
              <p className="text-xs" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
                DuoBalance
              </p>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => router.push('/settings')}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition-colors"
              style={{ 
                color: 'var(--on-surface-variant)', 
                background: 'var(--surface-container-low)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <span className="hidden sm:inline">Ajustes</span>
              <span className="sm:hidden">⚙️</span>
            </button>
            {!assignedProfile && (
              <button
                onClick={handleCambiarUsuario}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition-colors"
                style={{ 
                  color: 'var(--on-surface-variant)', 
                  background: 'var(--surface-container-low)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <span className="hidden sm:inline">Cambiar</span>
                <span className="sm:hidden">↔️</span>
              </button>
            )}
            <button
              onClick={handleLimpiarDatos}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition-colors"
              style={{ 
                color: 'var(--error)', 
                background: 'var(--error-container)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <span className="hidden sm:inline">Limpiar</span>
              <span className="sm:hidden">🗑️</span>
            </button>
            <button
              onClick={() => signOut()}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition-colors"
              style={{ 
                color: 'var(--primary)', 
                background: isDark ? 'rgba(179, 136, 255, 0.15)' : '#f3e8ff',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <span className="hidden sm:inline">Cerrar</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setVista('resumen')}
            className="px-6 py-3 text-sm font-medium transition-colors"
            style={{ 
              color: vista === 'resumen' ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: vista === 'resumen' ? '3px solid var(--primary)' : '3px solid transparent',
              fontFamily: 'Manrope, sans-serif'
            }}
          >
            Resumen
          </button>
          <button
            onClick={() => setVista('historial')}
            className="px-6 py-3 text-sm font-medium transition-colors"
            style={{ 
              color: vista === 'historial' ? 'var(--primary)' : 'var(--on-surface-variant)',
              borderBottom: vista === 'historial' ? '3px solid var(--primary)' : '3px solid transparent',
              fontFamily: 'Manrope, sans-serif'
            }}
          >
            Historial
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {vista === 'resumen' ? (
          <>
            <Resumen gastos={getGastosActuales()} currentUser={currentUser} />
            <GastoForm quien={currentUser} onAgregar={handleAgregarGasto} />
            <GastoList gastos={getGastosActuales()} />
          </>
        ) : (
          <Historial gastos={gastos} />
        )}
      </main>
    </div>
  )
}