'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gasto, Resumen as ResumenType } from '@/types'

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
  const [nombreEl, setNombreEl] = useState('André')
  const [nombreElla, setNombreElla] = useState('Diana')

  useEffect(() => {
    const storedNombreEl = localStorage.getItem('duobalance-nombre-el')
    const storedNombreElla = localStorage.getItem('duobalance-nombre-ella')
    if (storedNombreEl) setNombreEl(storedNombreEl)
    if (storedNombreElla) setNombreElla(storedNombreElla)
  }, [])

  return (
    <div 
      className="bg-white p-6"
      style={{ 
        borderRadius: '24px', 
        boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)'
      }}
    >
      <h2 
        className="text-xl font-semibold mb-6"
        style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}
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
          background: 'linear-gradient(135deg, #630ed4 0%, #7c3aed 100%)',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(99, 14, 212, 0.3)'
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm opacity-90" style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
              Gasto compartido
            </p>
            <p className="text-sm opacity-75" style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
              (se divide entre 2)
            </p>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
          </svg>
        </div>
        <p 
          className="text-3xl font-bold mb-2"
          style={{ color: '#ffffff', fontFamily: 'Manrope, sans-serif' }}
        >
          {formatCurrency(resumen.totalCompartido)}
        </p>
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-sm" style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
            Cada uno paga:
          </span>
          <span className="text-sm font-semibold" style={{ color: '#ffffff', fontFamily: 'Manrope, sans-serif' }}>
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
            background: '#f3f3f3',
            borderRadius: '16px'
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: '#82f5c1' }}
            >
              {localStorage.getItem('duobalance-avatar-el') || '👨'}
            </div>
            <div>
              <span className="font-semibold block" style={{ color: '#006c4a', fontFamily: 'Manrope, sans-serif' }}>
                {nombreEl}
              </span>
              <span className="text-xs" style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>
                {formatCurrency(resumen.propiosEl)} propios + {formatCurrency(resumen.mitadCompartido)} mitad
              </span>
            </div>
          </div>
          <span 
            className="text-xl font-bold px-4 py-2 rounded-xl"
            style={{ 
              color: '#006c4a', 
              fontFamily: 'Manrope, sans-serif',
              background: '#82f5c1'
            }}
          >
            {formatCurrency(resumen.debeEl)}
          </span>
        </div>

        {/* Ella */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ 
            background: '#f3f3f3',
            borderRadius: '16px'
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: '#ffd9e2' }}
            >
              {localStorage.getItem('duobalance-avatar-ella') || '👩'}
            </div>
            <div>
              <span className="font-semibold block" style={{ color: '#9d0050', fontFamily: 'Manrope, sans-serif' }}>
                {nombreElla}
              </span>
              <span className="text-xs" style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>
                {formatCurrency(resumen.propiosElla)} propios + {formatCurrency(resumen.mitadCompartido)} mitad
              </span>
            </div>
          </div>
          <span 
            className="text-xl font-bold px-4 py-2 rounded-xl"
            style={{ 
              color: '#9d0050', 
              fontFamily: 'Manrope, sans-serif',
              background: '#ffd9e2'
            }}
          >
            {formatCurrency(resumen.debeElla)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #f3f3f3' }}>
        <p className="text-sm mb-1" style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>Total entre ambos</p>
        <p 
          className="text-3xl font-bold" 
          style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}
        >
          {formatCurrency(resumen.debeEl + resumen.debeElla)}
        </p>
      </div>
    </div>
  )
}