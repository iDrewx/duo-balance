'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import UserSelector from '@/components/UserSelector'
import GastoForm from '@/components/GastoForm'
import GastoList from '@/components/GastoList'
import Resumen from '@/components/Resumen'
import Historial from '@/components/Historial'
import { useAuth } from '@/context/AuthContext'
import { Gasto, GastoTipo, UserRole } from '@/types'
import { getSupabase } from '@/lib/supabase'

// Storage key for local fallback
const STORAGE_KEY = 'gastos-compartidos-data'

export default function Home() {
  const router = useRouter()
  const { user: authUser, isLoading: authLoading, signOut } = useAuth()
  const [user, setUser] = useState<UserRole | null>(null)
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isClient, setIsClient] = useState(false)
  const [vista, setVista] = useState<'resumen' | 'historial'>('resumen')
  const [isLoading, setIsLoading] = useState(true)
  const [useLocalStorage, setUseLocalStorage] = useState(false)

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
          // Fetch without ordering first to see what columns exist
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
    setUseLocalStorage(true)
  }

  const saveLocalGastos = (data: Gasto[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const fetchGastosSupabase = async (supabase: any) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
      
      if (error) {
        console.error('Error fetching gastos:', error)
        loadLocalGastos()
      } else if (data) {
        setGastos(data)
      }
    } catch (err) {
      console.error('Error:', err)
      loadLocalGastos()
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar gastos al inicio y configurar realtime
  useEffect(() => {
    if (!isClient) return

    const supabase = getSupabase()
    if (!supabase) return

    // Nota: Realtime暂时 desactivado para evitar refetch visual
    // Los gastos se actualizan optimísticamente al insertar
    /*
    const channel = supabase
      .channel('gastos-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gastos'
      }, () => {
        fetchGastosSupabase(supabase)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    */
  }, [isClient])

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
    setUser(null)
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

  if (!user) {
    return <UserSelector onSelect={setUser} />
  }

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f9f9' }}>
        <div className="text-center">
          <div 
            className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f9f9f9' }}>
      {/* Header */}
      <header 
        className="bg-white sticky top-0 z-10"
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
                  ? '#82f5c1' 
                  : '#ffd9e2'
              }}
            >
              {user === 'el' 
                ? (typeof window !== 'undefined' ? localStorage.getItem('duobalance-avatar-el') || '👨' : '👨')
                : (typeof window !== 'undefined' ? localStorage.getItem('duobalance-avatar-ella') || '👩' : '👩')
              }
            </div>
            <div>
              <h1 
                className="text-lg font-bold"
                style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}
              >
                {user === 'el' 
                  ? (typeof window !== 'undefined' ? localStorage.getItem('duobalance-nombre-el') || 'André' : 'André')
                  : (typeof window !== 'undefined' ? localStorage.getItem('duobalance-nombre-ella') || 'Diana' : 'Diana')
                }
              </h1>
              <p className="text-xs" style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>
                DuoBalance
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/settings')}
              className="px-4 py-2 text-sm rounded-full transition-colors"
              style={{ 
                color: '#4a4455', 
                background: '#f3f3f3',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Ajustes
            </button>
            <button
              onClick={handleCambiarUsuario}
              className="px-4 py-2 text-sm rounded-full transition-colors"
              style={{ 
                color: '#4a4455', 
                background: '#f3f3f3',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Cambiar
            </button>
            <button
              onClick={handleLimpiarDatos}
              className="px-4 py-2 text-sm rounded-full transition-colors"
              style={{ 
                color: '#ba1a1a', 
                background: '#ffdad6',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Limpiar
            </button>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm rounded-full transition-colors"
              style={{ 
                color: '#630ed4', 
                background: '#f3e8ff',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setVista('resumen')}
            className="px-6 py-3 text-sm font-medium transition-colors"
            style={{ 
              color: vista === 'resumen' ? '#630ed4' : '#4a4455',
              borderBottom: vista === 'resumen' ? '3px solid #630ed4' : '3px solid transparent',
              fontFamily: 'Manrope, sans-serif'
            }}
          >
            Resumen
          </button>
          <button
            onClick={() => setVista('historial')}
            className="px-6 py-3 text-sm font-medium transition-colors"
            style={{ 
              color: vista === 'historial' ? '#630ed4' : '#4a4455',
              borderBottom: vista === 'historial' ? '3px solid #630ed4' : '3px solid transparent',
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
            <Resumen gastos={getGastosActuales()} currentUser={user} />
            <GastoForm quien={user} onAgregar={handleAgregarGasto} />
            <GastoList gastos={getGastosActuales()} />
          </>
        ) : (
          <Historial gastos={gastos} />
        )}
      </main>
    </div>
  )
}