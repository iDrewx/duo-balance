'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GastoTipo, UserRole } from '@/types'

interface GastoFormProps {
  quien: UserRole
  onAgregar: (monto: number, descripcion: string, tipo: GastoTipo) => void
}

export default function GastoForm({ quien, onAgregar }: GastoFormProps) {
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<GastoTipo>('compartido')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto || !descripcion) return
    
    setIsSubmitting(true)
    
    // Simular delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 300))
    
    onAgregar(Number(monto), descripcion, tipo)
    setIsSubmitting(false)
    setShowSuccess(true)
    
    // Reset fields with animation after success message
    setTimeout(() => {
      setMonto('')
      setDescripcion('')
      setTipo('compartido')
      setShowSuccess(false)
    }, 800)
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
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="descripcion-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full px-4 py-4 outline-none"
                style={{ 
                  background: 'var(--surface-container-low)',
                  borderRadius: '16px',
                  color: 'var(--on-surface-variant)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Listo
              </motion.div>
            ) : (
              <motion.input
                key="descripcion-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
            )}
          </AnimatePresence>
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
          >
            Monto ($)
          </label>
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="monto-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full px-4 py-4 outline-none"
                style={{ 
                  background: 'var(--surface-container-low)',
                  borderRadius: '16px',
                  color: 'var(--on-surface-variant)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Listo
              </motion.div>
            ) : (
              <motion.input
                key="monto-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
            )}
          </AnimatePresence>
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
          >
            Tipo de gasto
          </label>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              type="button"
              onClick={() => setTipo('compartido')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-4 font-medium transition-all"
              style={{ 
                background: tipo === 'compartido' 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)' 
                  : 'var(--surface-container-low)',
                color: tipo === 'compartido' ? '#ffffff' : 'var(--on-surface-variant)',
                borderRadius: '9999px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: tipo === 'compartido' ? '0 8px 24px rgba(99, 14, 212, 0.3)' : 'none',
                scale: tipo === 'compartido' ? 1.05 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              Compartido
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setTipo('propio')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-4 font-medium transition-all"
              style={{ 
                background: tipo === 'propio' ? 'var(--on-surface)' : 'var(--surface-container-low)',
                color: tipo === 'propio' ? 'var(--surface)' : 'var(--on-surface-variant)',
                borderRadius: '9999px',
                fontFamily: 'Inter, sans-serif',
                scale: tipo === 'propio' ? 1.05 : 1,
                boxShadow: tipo === 'propio' ? '0 8px 24px rgba(0, 0, 0, 0.2)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Propio
            </motion.button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting || showSuccess}
          whileHover={!isSubmitting && !showSuccess ? { scale: 1.02, boxShadow: '0 12px 32px rgba(99, 14, 212, 0.4)' } : {}}
          whileTap={!isSubmitting && !showSuccess ? { scale: 0.98 } : {}}
          transition={{ duration: 0.2 }}
          className="w-full py-4 font-semibold rounded-full flex items-center justify-center gap-2"
          style={{ 
            background: showSuccess 
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            color: 'var(--on-primary)',
            fontFamily: 'Inter, sans-serif',
            boxShadow: showSuccess 
              ? '0 8px 24px rgba(34, 197, 94, 0.3)' 
              : '0 8px 24px rgba(99, 14, 212, 0.3)',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          <AnimatePresence mode="wait">
            {isSubmitting ? (
              <motion.svg
                key="spinner"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </motion.svg>
            ) : showSuccess ? (
              <motion.svg
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5"/>
              </motion.svg>
            ) : (
              <motion.svg
                key="plus"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14"/>
              </motion.svg>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={showSuccess ? 'success-text' : isSubmitting ? 'submitting-text' : 'normal-text'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {isSubmitting ? 'Agregando...' : showSuccess ? '¡Agregado!' : 'Agregar Gasto'}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.form>
  )
}