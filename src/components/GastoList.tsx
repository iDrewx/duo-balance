'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Gasto } from '@/types'

interface GastoListProps {
  gastos: Gasto[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })
}

export default function GastoList({ gastos }: GastoListProps) {
  if (gastos.length === 0) {
    return (
      <div 
        className="bg-white p-8 text-center"
        style={{ 
          borderRadius: '24px', 
          boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)'
        }}
      >
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          className="mx-auto mb-4"
          style={{ opacity: 0.3 }}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4a4455"/>
        </svg>
        <p style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>No hay gastos registrados</p>
      </div>
    )
  }

  // Sort by date descending
  const sortedGastos = [...gastos].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  return (
    <div 
      className="bg-white overflow-hidden"
      style={{ 
        borderRadius: '24px', 
        boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)'
      }}
    >
      <div 
        className="px-6 py-5"
        style={{ background: '#f3f3f3' }}
      >
        <h2 
          className="text-lg font-semibold"
          style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}
        >
          Gastos recientes
        </h2>
      </div>
      
      <div>
        <AnimatePresence initial={false}>
          {sortedGastos.map((gasto) => (
            <motion.div
              key={gasto.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="px-6 py-4 flex items-center justify-between"
              style={{ 
                borderBottom: '1px solid #f3f3f3'
              }}
            >
            <div className="flex items-center gap-4">
              {/* Icono de usuario */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  background: gasto.quien === 'el' ? '#82f5c1' : '#ffd9e2'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" 
                    fill={gasto.quien === 'el' ? '#006c4a' : '#9d0050'}
                  />
                  <path 
                    d="M12 14C8.67 14 2 15.67 2 19V21H22V19C22 15.67 15.33 14 12 14Z" 
                    fill={gasto.quien === 'el' ? '#006c4a' : '#9d0050'}
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium" style={{ color: '#1a1c1c', fontFamily: 'Inter, sans-serif' }}>
                  {gasto.descripcion}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>
                    {formatDate(gasto.fecha)}
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      background: gasto.tipo === 'compartido' ? '#eaddff' : '#f3f3f3',
                      color: gasto.tipo === 'compartido' ? '#630ed4' : '#4a4455',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {gasto.tipo === 'compartido' ? 'Compartido' : 'Propio'}
                  </span>
                </div>
              </div>
            </div>
            
            <span 
              className="font-bold text-lg"
              style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}
            >
              {formatCurrency(gasto.monto)}
            </span>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  )
}