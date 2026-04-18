'use client'

import { useMemo, useState } from 'react'
import { Gasto, Resumen as ResumenType } from '@/types'

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
  const [corteExpandido, setCorteExpandido] = useState<string | null>(null)
  
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
      <div className="bg-white rounded-xl p-8 shadow-sm border border-zinc-100 text-center">
        <p className="text-zinc-400">No hay gastos en el historial</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100">
        <h2 className="text-lg font-semibold text-zinc-800">Historial por corte</h2>
        <p className="text-sm text-zinc-500">Corte de tarjeta: dia {DIA_CORTE} de cada mes</p>
      </div>
      
      <div className="divide-y divide-zinc-100">
        {cortesAgrupados.map((corte) => (
          <div key={corte.id}>
            {/* Header del corte - clickeable */}
            <button
              onClick={() => setCorteExpandido(corteExpandido === corte.id ? null : corte.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {corteExpandido === corte.id ? '▼' : '▶'}
                </span>
                <span className="font-semibold text-zinc-800">{corte.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-500">
                  {corte.gastos.length} gasto{corte.gastos.length !== 1 ? 's' : ''}
                </span>
                <span className="font-bold text-zinc-800">
                  {formatCurrency(corte.resumen.debeEl + corte.resumen.debeElla)}
                </span>
              </div>
            </button>
            
            {/* Detalle expandido */}
            {corteExpandido === corte.id && (
              <div className="px-6 pb-4 bg-zinc-50">
                {/* Resumen del corte */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Compartido</p>
                    <p className="font-semibold text-purple-600">
                      {formatCurrency(corte.resumen.totalCompartido)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Cada uno paga</p>
                    <p className="font-semibold text-zinc-700">
                      {formatCurrency(corte.resumen.mitadCompartido)}
                    </p>
                  </div>
                </div>
                
                {/* Lista de gastos del corte */}
                <div className="space-y-2">
                  {corte.gastos.map((gasto) => (
                    <div
                      key={gasto.id}
                      className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {gasto.quien === 'el' ? '👨' : '👩'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-zinc-800">
                            {gasto.descripcion}
                          </p>
                          <p className={`text-xs px-2 py-0.5 rounded ${
                            gasto.tipo === 'compartido' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {gasto.tipo === 'compartido' ? 'Compartido' : 'Propio'}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-zinc-800">
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