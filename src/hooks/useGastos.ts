'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gasto, GastoTipo, UserRole } from '@/types'
import { getSupabase } from '@/lib/supabase'

const STORAGE_KEY = 'gastos-compartidos-data'

export function useGastos(user: UserRole | null) {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmLimpiar, setConfirmLimpiar] = useState(false)

  // Cargar gastos al inicio
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Suscribirse a cambios en tiempo real de gastos
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase
      .channel('gastos-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'gastos'
      }, (payload) => {
        const newGasto = payload.new as Gasto
        setGastos(prev => {
          // Evitar duplicados si el gasto ya está en la lista
          if (prev.some(g => g.id === newGasto.id)) return prev
          return [newGasto, ...prev]
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'gastos'
      }, (payload) => {
        const updatedGasto = payload.new as Gasto
        setGastos(prev => prev.map(g => g.id === updatedGasto.id ? updatedGasto : g))
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'gastos'
      }, (payload) => {
        const deletedId = payload.old.id
        setGastos(prev => prev.filter(g => g.id !== deletedId))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadLocalGastos = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setGastos(JSON.parse(stored))
      } catch (e) {
        console.error('Error parsing local data:', e)
      }
    }
    setIsLoading(false)
  }, [])

  const saveLocalGastos = useCallback((data: Gasto[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [])

  const handleAgregarGasto = useCallback(async (monto: number, descripcion: string, tipo: GastoTipo) => {
    if (!user) return

    const nuevoGasto: Partial<Gasto> = {
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
        const updated = [nuevoGasto as Gasto, ...prev]
        saveLocalGastos(updated)
        return updated
      })
    }
  }, [user, saveLocalGastos])

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

  const handleEditGasto = useCallback(async (gastoId: string, updates: { monto?: number; descripcion?: string; tipo?: GastoTipo }) => {
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { error } = await supabase
          .from('gastos')
          .update(updates)
          .eq('id', gastoId)

        if (error) {
          console.error('Error updating gasto:', error)
        }
      } catch (err) {
        console.error('Error:', err)
      }
    }
    // Update local state
    setGastos(prev => prev.map(g =>
      g.id === gastoId ? { ...g, ...updates } : g
    ))
    // Also update localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const localGastos = JSON.parse(stored)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(
          localGastos.map((g: Gasto) => g.id === gastoId ? { ...g, ...updates } : g)
        ))
      } catch (e) {
        console.error('Error updating localStorage:', e)
      }
    }
  }, [])

  const handleLimpiarDatos = useCallback(() => {
    setConfirmLimpiar(true)
  }, [])

  const confirmLimpiarAction = useCallback(async () => {
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
  }, [])

  const cancelLimpiar = useCallback(() => {
    setConfirmLimpiar(false)
  }, [])

  const getGastosActuales = useCallback(() => {
    const ahora = new Date()
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
    return gastos.filter(g => new Date(g.fecha) >= hace30Dias)
  }, [gastos])

  return {
    gastos,
    isLoading,
    confirmLimpiar,
    handleAgregarGasto,
    handleDeleteGasto,
    handleEditGasto,
    handleLimpiarDatos,
    confirmLimpiarAction,
    cancelLimpiar,
    getGastosActuales,
  }
}
