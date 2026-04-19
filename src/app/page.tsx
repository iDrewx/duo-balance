'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import UserSelector from '@/components/UserSelector'
import GastoForm from '@/components/GastoForm'
import GastoList from '@/components/GastoList'
import Resumen from '@/components/Resumen'
import Historial from '@/components/Historial'
import ConfirmModal from '@/components/ConfirmModal'
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
  const [confirmLimpiar, setConfirmLimpiar] = useState(false)

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
    setConfirmLimpiar(true)
  }

  const confirmLimpiarAction = async () => {
    setConfirmLimpiar(false)
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

  const cancelLimpiar = () => {
    setConfirmLimpiar(false)
  }

  const handleDeleteGasto = useCallback(async (gastoId: string) => {
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { error } = await supabase
          .from('gastos')
          .delete()
          .eq('id', gastoId)

        if (error) {
          console.error('Error deleting gasto:', error)
        }
      } catch (err) {
        console.error('Error:', err)
      }
    }
    // Update local state
    setGastos(prev => prev.filter(g => g.id !== gastoId))
    // Also update localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const localGastos = JSON.parse(stored)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localGastos.filter((g: Gasto) => g.id !== gastoId)))
      } catch (e) {
        console.error('Error updating localStorage:', e)
      }
    }
  }, [])

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
              <svg className="sm:hidden w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.9c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.48 1a7.23 7.23 0 0 0-1.72-.28l-.38-2.14A.5.5 0 0 0 14.28 2H10a.5.5 0 0 0-.5.42l-.38 2.14c-.6.13-1.15.2-1.72.28l-2.48-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.63c-.04.32-.07.65-.07.97s.03.65.07.97l-2.11 1.63a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.48-1c.57.08 1.12.15 1.72.28l.38 2.14c.04.18.22.42.5.42h4.28a.5.5 0 0 0 .5-.42l.38-2.14c.6-.13 1.15-.2 1.72-.28l2.48 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.63z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
              <svg className="sm:hidden w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16M3 14h13c1.1 0 2 .9 2 2v0c0-1.1-.9-2-2-2h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
              <svg className="sm:hidden w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M19 7L18.1327 19.1425C18.0573 20.8857 16.8029 22.2435 15.0643 22.1052L8.9133 21.0193C7.14189 20.8783 5.60101 19.3292 5.49236 17.5545L5.15894 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 17V13M14 17V13M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M2 7H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
              <svg className="sm:hidden w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 16v-6m0-6V5m0 0l7 7m-7-7l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
            <GastoList gastos={getGastosActuales()} onDelete={handleDeleteGasto} />
          </>
        ) : (
          <Historial gastos={gastos} />
        )}
      </main>

      <ConfirmModal
        show={confirmLimpiar}
        title="¿Limpiar gastos?"
        message="Esto eliminará todos los gastos. Esta acción no se puede deshacer."
        onConfirm={confirmLimpiarAction}
        onCancel={cancelLimpiar}
      />
    </div>
  )
}