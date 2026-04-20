'use client'

import { useMemo, useState } from 'react'
import { Gasto, Resumen as ResumenType } from '@/types'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'
import { getAvatarUrl } from '@/lib/dicebear'

interface HistorialProps {
  gastos: Gasto[]
}

type UserRole = 'el' | 'ella'

const DIA_CORTE = 10 // El corte de la tarjeta es el dia 10 de cada mes

function getCorteId(fecha: string): string {
  const date = new Date(fecha)
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // Si el dia es menor al corte, pertenece al corte anterior
  // Si el dia es mayor o igual al corte, pertenece al corte actual
  const day = date.getDate()
  
  // Si el gasto es antes del dia de corte, pertenece al mes anterior
  // del corte (ej: 5 de enero = corte de diciembre)
  let mesCorte = month
  let anioCorte = year
  
  if (day < DIA_CORTE) {
    mesCorte = month - 1
    if (mesCorte < 0) {
      mesCorte = 11
      anioCorte = year - 1
    }
  }
  
  return `${anioCorte}-${String(mesCorte + 1).padStart(2, '0')}`
}

function formatCorteLabel(corteId: string): string {
  const [year, month] = corteId.split('-')
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return `${months[parseInt(month) - 1]} ${year}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

function calculateResumen(gastos: Gasto[]): ResumenType {
  let totalCompartido = 0
  let propiosEl = 0
  let propiosElla = 0

  gastos.forEach(gasto => {
    if (gasto.tipo === 'compartido') {
      totalCompartido += gasto.monto
    } else {
      if (gasto.quien === 'el') {
        propiosEl += gasto.monto
      } else {
        propiosElla += gasto.monto
      }
    }
  })

  const mitadCompartido = totalCompartido / 2
  const pagoEl = propiosEl + mitadCompartido
  const pagoElla = propiosElla + mitadCompartido

  return {
    totalGastos: 0,
    totalCompartido,
    propiosEl,
    propiosElla,
    mitadCompartido,
    debeEl: pagoEl,
    debeElla: pagoElla,
  }
}

export default function Historial({ gastos }: HistorialProps) {
  const { isDark } = useTheme()
  const { settings } = useUserSettings()
  const [corteExpandido, setCorteExpandido] = useState<string | null>(null)
  
  const avatarElSeed = settings?.avatar_el_seed || 'default-el'
  const avatarEllaSeed = settings?.avatar_ella_seed || 'default-ella'
  
  const cortesAgrupados = useMemo(() => {
    const grupos: Record<string, Gasto[]> = {}
    
    gastos.forEach(gasto => {
      const corteId = getCorteId(gasto.fecha)
      if (!grupos[corteId]) {
        grupos[corteId] = []
      }
      grupos[corteId].push(gasto)
    })
    
    // Ordenar por fecha descendente (mas reciente primero)
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([corteId, gastosCorte]) => ({
        id: corteId,
        label: formatCorteLabel(corteId),
        gastos: gastosCorte.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        ),
        resumen: calculateResumen(gastosCorte)
      }))
  }, [gastos])

  if (cortesAgrupados.length === 0) {
    return (
      <div className="bg-[var(--surface-container-lowest)] rounded-xl p-8 shadow-sm text-center">
        <p className="text-[var(--on-surface-variant)]">No hay gastos en el historial</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface-container-lowest)] rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--outline-variant)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--on-surface)' }}>Historial por corte</h2>
        <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Corte de tarjeta: dia {DIA_CORTE} de cada mes</p>
      </div>
      
      <div>
        {cortesAgrupados.map((corte) => (
          <div key={corte.id}>
            {/* Header del corte - clickeable */}
            <button
              onClick={() => setCorteExpandido(corteExpandido === corte.id ? null : corte.id)}
              className="w-full px-6 py-4 flex items-center justify-between transition-colors"
              style={{ background: 'var(--surface-container-lowest)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {corteExpandido === corte.id ? '▼' : '▶'}
                </span>
                <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>{corte.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  {corte.gastos.length} gasto{corte.gastos.length !== 1 ? 's' : ''}
                </span>
                <span className="font-bold" style={{ color: 'var(--on-surface)' }}>
                  {formatCurrency(corte.resumen.debeEl + corte.resumen.debeElla)}
                </span>
              </div>
            </button>
            
            {/* Detalle expandido */}
            {corteExpandido === corte.id && (
              <div className="px-6 pb-4" style={{ background: 'var(--surface-container-low)' }}>
                {/* Resumen del corte */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[var(--surface-container-lowest)] p-3 rounded-lg">
                    <p className="text-xs mb-1" style={{ color: 'var(--on-surface-variant)' }}>Compartido</p>
                    <p className="font-semibold" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(corte.resumen.totalCompartido)}
                    </p>
                  </div>
                  <div className="bg-[var(--surface-container-lowest)] p-3 rounded-lg">
                    <p className="text-xs mb-1" style={{ color: 'var(--on-surface-variant)' }}>Cada uno paga</p>
                    <p className="font-semibold" style={{ color: 'var(--on-surface)' }}>
                      {formatCurrency(corte.resumen.mitadCompartido)}
                    </p>
                  </div>
                </div>
                
                {/* Lista de gastos del corte */}
                <div className="space-y-2">
                  {corte.gastos.map((gasto) => (
                    <div
                      key={gasto.id}
                      className="flex items-center justify-between py-2 px-3 bg-[var(--surface-container-lowest)] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={gasto.quien === 'el' ? getAvatarUrl(avatarElSeed) : getAvatarUrl(avatarEllaSeed)}
                          alt="avatar"
                          className="w-6 h-6"
                        />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
                            {gasto.descripcion}
                          </p>
                          <p className={`text-xs px-2 py-0.5 rounded ${
                            gasto.tipo === 'compartido' 
                              ? isDark ? 'rgba(179, 136, 255, 0.2)' : 'rgba(99, 14, 212, 0.1)'
                              : 'var(--surface-container-low)'
                          }`}
                          style={{ 
                            color: gasto.tipo === 'compartido' ? 'var(--primary)' : 'var(--on-surface-variant)'
                          }}>
                            {gasto.tipo === 'compartido' ? 'Compartido' : 'Propio'}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>
                        {formatCurrency(gasto.monto)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}