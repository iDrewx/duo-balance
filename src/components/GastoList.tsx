'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Gasto } from '@/types'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'

interface GastoListProps {
  gastos: Gasto[]
  onDelete?: (gastoId: string) => Promise<void>
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

export default function GastoList({ gastos, onDelete }: GastoListProps) {
  const { isDark } = useTheme()
  const { settings } = useUserSettings()
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
        {sortedGastos.map((gasto) => (
          <SwipeableGasto
            key={gasto.id}
            gasto={gasto}
            avatarEl={avatarEl}
            avatarElla={avatarElla}
            isDark={isDark}
            isDeleting={deletingId === gasto.id}
            onDelete={async () => {
              if (onDelete) {
                const confirmed = confirm('¿Eliminar este gasto?')
                if (confirmed) {
                  setDeletingId(gasto.id)
                  try {
                    await onDelete(gasto.id)
                  } finally {
                    setDeletingId(null)
                  }
                }
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Componente individual de gasto con swipe
function SwipeableGasto({
  gasto,
  avatarEl,
  avatarElla,
  isDark,
  isDeleting,
  onDelete,
}: {
  gasto: Gasto
  avatarEl: string
  avatarElla: string
  isDark: boolean
  isDeleting: boolean
  onDelete: () => Promise<void>
}) {
  const x = useMotionValue(0)
  const background = useTransform(
    x,
    [-100, 0],
    ['var(--error)', 'var(--surface-container-low)']
  )
  const iconOpacity = useTransform(x, [-80, -20], [1, 0])

  return (
    <div className="relative overflow-hidden">
      {/* Background con ícono de trash (solo visible al Swipe) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-6"
        style={{ background }}
      >
        <motion.div style={{ opacity: iconOpacity }}>
          {isDeleting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 7L18.1327 19.1425C18.0573 20.8857 16.8029 22.2435 15.0643 22.1052L8.9133 21.0193C7.14189 20.8783 5.60101 19.3292 5.49236 17.5545L5.15894 11"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 17V13M14 17V13M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M2 7H22"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </motion.div>
      </motion.div>

      {/* Item swipeable */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) {
            onDelete()
          }
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="px-6 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing bg-[var(--surface-container-lowest)]"
        style={{ x, borderBottom: '1px solid var(--surface-container-low)' }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar del usuario */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{
              background:
                gasto.quien === 'el'
                  ? 'var(--secondary-container)'
                  : 'var(--tertiary-container)',
            }}
          >
            {gasto.quien === 'el' ? avatarEl : avatarElla}
          </div>
          <div>
            <p
              className="font-medium"
              style={{
                color: 'var(--on-surface)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {gasto.descripcion}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs"
                style={{
                  color: 'var(--on-surface-variant)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {formatDate(gasto.fecha)}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background:
                    gasto.tipo === 'compartido'
                      ? isDark
                        ? 'rgba(179, 136, 255, 0.2)'
                        : '#eaddff'
                      : 'var(--surface-container-low)',
                  color:
                    gasto.tipo === 'compartido'
                      ? 'var(--primary)'
                      : 'var(--on-surface-variant)',
                  fontFamily: 'Inter, sans-serif',
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
    </div>
  )
}
