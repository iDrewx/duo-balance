'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gasto } from '@/types'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'

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
  const { isDark } = useTheme()
  const { settings } = useUserSettings()

  const avatarEl = settings?.avatar_el || '👨'
  const avatarElla = settings?.avatar_ella || '👩'
  if (gastos.length === 0) {
    return (
      <div 
        className="bg-[var(--surface-container-lowest)] p-8 text-center"
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
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="var(--on-surface-variant)"/>
        </svg>
        <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>No hay gastos registrados</p>
      </div>
    )
  }

  // Sort by date descending
  const sortedGastos = [...gastos].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  return (
    <div 
      className="bg-[var(--surface-container-lowest)] overflow-hidden"
      style={{ 
        borderRadius: '24px', 
        boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)'
      }}
    >
      <div 
        className="px-6 py-5"
        style={{ background: 'var(--surface-container-low)' }}
      >
        <h2 
          className="text-lg font-semibold"
          style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
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
                borderBottom: '1px solid var(--surface-container-low)'
              }}
            >
            <div className="flex items-center gap-4">
              {/* Avatar del usuario */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ 
                  background: gasto.quien === 'el' ? 'var(--secondary-container)' : 'var(--tertiary-container)'
                }}
              >
                {gasto.quien === 'el' ? avatarEl : avatarElla}
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--on-surface)', fontFamily: 'Inter, sans-serif' }}>
                  {gasto.descripcion}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
                    {formatDate(gasto.fecha)}
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      background: gasto.tipo === 'compartido' ? isDark ? 'rgba(179, 136, 255, 0.2)' : '#eaddff' : 'var(--surface-container-low)',
                      color: gasto.tipo === 'compartido' ? 'var(--primary)' : 'var(--on-surface-variant)',
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
              style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
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