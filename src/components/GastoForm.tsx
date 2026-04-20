'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GastoTipo, UserRole } from '@/types'

interface GastoFormProps {
  quien: UserRole
  onAgregar: (monto: number, descripcion: string, tipo: GastoTipo) => void
}

export default function GastoForm({ quien, onAgregar }: GastoFormProps) {
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<GastoTipo>('compartido')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto || !descripcion) return
    
    onAgregar(Number(monto), descripcion, tipo)
    setMonto('')
    setDescripcion('')
setTipo('compartido')
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      onSubmit={handleSubmit} 
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
        Agregar gasto
      </h2>
      
      <div className="space-y-5">
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
          >
            Descripcion
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Supermercado"
            className="w-full px-4 py-4 outline-none transition-all"
            style={{ 
              background: 'var(--surface-container-low)',
              border: 'none',
              borderRadius: '16px',
              color: 'var(--on-surface)',
              fontFamily: 'Inter, sans-serif'
            }}
            required
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
          >
            Monto ($)
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-4 outline-none transition-all"
            style={{ 
              background: 'var(--surface-container-low)',
              border: 'none',
              borderRadius: '16px',
              color: 'var(--on-surface)',
              fontFamily: 'Inter, sans-serif'
            }}
            required
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
          >
            Tipo de gasto
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTipo('compartido')}
              className="px-6 py-4 font-medium transition-all"
              style={{ 
                background: tipo === 'compartido' 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)' 
                  : 'var(--surface-container-low)',
                color: tipo === 'compartido' ? '#ffffff' : 'var(--on-surface-variant)',
                borderRadius: '9999px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: tipo === 'compartido' ? '0 8px 24px rgba(99, 14, 212, 0.3)' : 'none'
              }}
            >
              Compartido
            </button>
            <button
              type="button"
              onClick={() => setTipo('propio')}
              className="px-6 py-4 font-medium transition-all"
              style={{ 
                background: tipo === 'propio' ? 'var(--on-surface)' : 'var(--surface-container-low)',
                color: tipo === 'propio' ? 'var(--surface)' : 'var(--on-surface-variant)',
                borderRadius: '9999px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Propio
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 font-semibold rounded-full transition-all flex items-center justify-center gap-2"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            color: 'var(--on-primary)',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 24px rgba(99, 14, 212, 0.3)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Agregar Gasto
        </button>
      </div>
    </motion.form>
  )
}