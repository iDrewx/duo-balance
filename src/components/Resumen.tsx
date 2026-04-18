'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gasto, Resumen as ResumenType } from '@/types'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'

interface ResumenProps {
  gastos: Gasto[]
  currentUser: UserRole
}

type UserRole = 'el' | 'ella'

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

export default function Resumen({ gastos, currentUser }: ResumenProps) {
  const resumen = calculateResumen(gastos)
  const { isDark } = useTheme()
  const { settings } = useUserSettings()

  const nombreEl = settings?.nombre_el || 'André'
  const nombreElla = settings?.nombre_ella || 'Diana'
  const avatarEl = settings?.avatar_el || '👨'
  const avatarElla = settings?.avatar_ella || '👩'

  return (
    <div 
      className="bg-[var(--surface-container-lowest)] p-6"
      style={{ 
        borderRadius: '24px', 
        boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)'
      }}
    >
      <h2 
        className="text-xl font-semibold mb-6"
        style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
      >
        Resumen del periodo
      </h2>
      
      {/* Gasto compartido - Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6 p-5"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(99, 14, 212, 0.3)'
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm opacity-90" style={{ color: isDark ? '#1a1c1c' : '#ffffff', fontFamily: 'Inter, sans-serif' }}>
              Gasto compartido
            </p>
            <p className="text-sm opacity-75" style={{ color: isDark ? '#1a1c1c' : '#ffffff', fontFamily: 'Inter, sans-serif' }}>
              (se divide entre 2)
            </p>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill={isDark ? '#1a1c1c' : 'white'}/>
          </svg>
        </div>
        <p 
          className="text-3xl font-bold mb-2"
          style={{ color: isDark ? '#1a1c1c' : '#ffffff', fontFamily: 'Manrope, sans-serif' }}
        >
          {formatCurrency(resumen.totalCompartido)}
        </p>
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: isDark ? 'rgba(26, 28, 28, 0.2)' : 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-sm" style={{ color: isDark ? '#1a1c1c' : '#ffffff', fontFamily: 'Inter, sans-serif' }}>
            Cada uno paga:
          </span>
          <span className="text-sm font-semibold" style={{ color: isDark ? '#1a1c1c' : '#ffffff', fontFamily: 'Manrope, sans-serif' }}>
            {formatCurrency(resumen.mitadCompartido)}
          </span>
        </div>
      </motion.div>

      {/* Lo que paga cada uno */}
      <div className="space-y-4">
        {/* El */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ 
            background: 'var(--surface-container-low)',
            borderRadius: '16px'
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--secondary-container)' }}
            >
              {avatarEl}
            </div>
            <div>
              <span className="font-semibold block" style={{ color: 'var(--secondary)', fontFamily: 'Manrope, sans-serif' }}>
                {nombreEl}
              </span>
              <span className="text-xs" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
                {formatCurrency(resumen.propiosEl)} propios + {formatCurrency(resumen.mitadCompartido)} mitad
              </span>
            </div>
          </div>
          <span 
            className="text-xl font-bold px-4 py-2 rounded-xl"
            style={{ 
              color: 'var(--secondary)', 
              fontFamily: 'Manrope, sans-serif',
              background: 'var(--secondary-container)'
            }}
          >
            {formatCurrency(resumen.debeEl)}
          </span>
        </div>

        {/* Ella */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ 
            background: 'var(--surface-container-low)',
            borderRadius: '16px'
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--tertiary-container)' }}
            >
              {avatarElla}
            </div>
            <div>
              <span className="font-semibold block" style={{ color: 'var(--tertiary)', fontFamily: 'Manrope, sans-serif' }}>
                {nombreElla}
              </span>
              <span className="text-xs" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
                {formatCurrency(resumen.propiosElla)} propios + {formatCurrency(resumen.mitadCompartido)} mitad
              </span>
            </div>
          </div>
          <span 
            className="text-xl font-bold px-4 py-2 rounded-xl"
            style={{ 
              color: 'var(--tertiary)', 
              fontFamily: 'Manrope, sans-serif',
              background: 'var(--tertiary-container)'
            }}
          >
            {formatCurrency(resumen.debeElla)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid var(--surface-container-low)' }}>
        <p className="text-sm mb-1" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>Total entre ambos</p>
        <p 
          className="text-3xl font-bold" 
          style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
        >
          {formatCurrency(resumen.debeEl + resumen.debeElla)}
        </p>
      </div>
    </div>
  )
}