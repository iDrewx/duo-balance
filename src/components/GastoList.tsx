'use client'

import { useState, useEffect } from 'react'
import { Gasto, GastoTipo } from '@/types'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'

interface GastoListProps {
  gastos: Gasto[]
  onDelete?: (gastoId: string) => Promise<void>
  onEdit?: (gastoId: string, updates: { monto?: number; descripcion?: string; tipo?: 'compartido' | 'propio' }) => Promise<void>
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

export default function GastoList({ gastos, onDelete, onEdit }: GastoListProps) {
  const { isDark } = useTheme()
  const { settings } = useUserSettings()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null })
  const [editingGasto, setEditingGasto] = useState<{ show: boolean; gasto: Gasto | null }>({ show: false, gasto: null })
  const [editForm, setEditForm] = useState({ monto: '', descripcion: '', tipo: 'propio' as GastoTipo })
  const [newlyAdded, setNewlyAdded] = useState<Set<string>>(new Set())

  const avatarEl = settings?.avatar_el || '👨'
  const avatarElla = settings?.avatar_ella || '👩'

  // Track newly added expenses for animation
  useEffect(() => {
    const newItems = gastos.slice(0, 3).map(g => g.id)
    setNewlyAdded(new Set(newItems))
  }, [])

  const handleDeleteClick = (gastoId: string) => {
    setConfirmDelete({ show: true, id: gastoId })
  }

  const confirmDeleteAction = async () => {
    const gastoId = confirmDelete.id
    if (gastoId) {
      // Trigger exit animation first
      setConfirmDelete({ show: false, id: gastoId })
      
      // Wait for animation, then delete
      setTimeout(async () => {
        setDeletingId(gastoId)
        try {
          if (onDelete) {
            await onDelete(gastoId)
          }
        } finally {
          setDeletingId(null)
        }
      }, 300)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete({ show: false, id: null })
  }

  const handleEditClick = (gasto: Gasto) => {
    setEditForm({ monto: gasto.monto.toString(), descripcion: gasto.descripcion, tipo: gasto.tipo })
    setEditingGasto({ show: true, gasto })
  }

  const saveEdit = async () => {
    const gasto = editingGasto.gasto
    if (!gasto || !onEdit) return

    const updates: { monto?: number; descripcion?: string; tipo?: GastoTipo } = {}
    if (editForm.monto && parseFloat(editForm.monto) !== gasto.monto) {
      updates.monto = parseFloat(editForm.monto)
    }
    if (editForm.descripcion !== gasto.descripcion) {
      updates.descripcion = editForm.descripcion
    }
    if (editForm.tipo !== gasto.tipo) {
      updates.tipo = editForm.tipo
    }

    if (Object.keys(updates).length > 0) {
      await onEdit(gasto.id, updates)
    }

    setEditingGasto({ show: false, gasto: null })
  }

  const cancelEdit = () => {
    setEditingGasto({ show: false, gasto: null })
  }

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
    <>
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
          {sortedGastos.map((gasto, index) => (
            <GastoItem
              key={gasto.id}
              gasto={gasto}
              avatarEl={avatarEl}
              avatarElla={avatarElla}
              isDark={isDark}
              isDeleting={deletingId === gasto.id}
              isNew={newlyAdded.has(gasto.id)}
              animationDelay={index * 0.05}
              onDeleteClick={() => handleDeleteClick(gasto.id)}
              onEditClick={() => handleEditClick(gasto)}
            />
          ))}
        </div>
      </div>

      {/* Custom Confirm Modal */}
      {confirmDelete.show && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={cancelDelete}
        >
          <div 
            className="bg-[var(--surface-container-lowest)] p-6 max-w-sm w-full"
            style={{ borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--error-container)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--error)' }}>
                  <path d="M19 7L18.1327 19.1425C18.0573 20.8857 16.8029 22.2435 15.0643 22.1052L8.9133 21.0193C7.14189 20.8783 5.60101 19.3292 5.49236 17.5545L5.15894 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 17V13M14 17V13M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M2 7H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
              >
                ¿Eliminar gasto?
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
              >
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3 rounded-full font-medium"
                style={{ 
                  background: 'var(--surface-container-low)',
                  color: 'var(--on-surface)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 py-3 rounded-full font-medium"
                style={{ 
                  background: 'var(--error)',
                  color: 'white',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGasto.show && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={cancelEdit}
        >
          <div 
            className="bg-[var(--surface-container-lowest)] p-6 max-w-sm w-full"
            style={{ borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 
              className="text-xl font-semibold mb-6"
              style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
            >
              Editar gasto
            </h3>
            
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
                >
                  Descripción
                </label>
                <input
                  type="text"
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-4 py-3 outline-none"
                  style={{ 
                    background: 'var(--surface-container-low)',
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
                  value={editForm.monto}
                  onChange={(e) => setEditForm(prev => ({ ...prev, monto: e.target.value }))}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 outline-none"
                  style={{ 
                    background: 'var(--surface-container-low)',
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
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, tipo: 'compartido' }))}
                    className="px-4 py-3 font-medium transition-all"
                    style={{ 
                      background: editForm.tipo === 'compartido' 
                        ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)' 
                        : 'var(--surface-container-low)',
                      color: editForm.tipo === 'compartido' ? '#ffffff' : 'var(--on-surface-variant)',
                      borderRadius: '9999px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Compartido
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, tipo: 'propio' }))}
                    className="px-4 py-3 font-medium transition-all"
                    style={{ 
                      background: editForm.tipo === 'propio' ? 'var(--on-surface)' : 'var(--surface-container-low)',
                      color: editForm.tipo === 'propio' ? 'var(--surface)' : 'var(--on-surface-variant)',
                      borderRadius: '9999px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Propio
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelEdit}
                className="flex-1 py-3 rounded-full font-medium"
                style={{ 
                  background: 'var(--surface-container-low)',
                  color: 'var(--on-surface)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-3 rounded-full font-medium"
                style={{ 
                  background: 'var(--primary)',
                  color: 'white',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Componente individual de gasto con animaciones
function GastoItem({
  gasto,
  avatarEl,
  avatarElla,
  isDark,
  isDeleting,
  isNew,
  animationDelay,
  onDeleteClick,
  onEditClick,
}: {
  gasto: Gasto
  avatarEl: string
  avatarElla: string
  isDark: boolean
  isDeleting: boolean
  isNew: boolean
  animationDelay: number
  onDeleteClick: () => void
  onEditClick: () => void
}) {
  return (
    <div 
      className={`px-6 py-4 flex items-center justify-between border-b transition-all duration-300 ${
        isNew ? 'animate-slide-in' : ''
      } ${isDeleting ? 'animate-slide-out opacity-0' : ''}`}
      style={{ 
        borderColor: 'var(--surface-container-low)',
        background: 'var(--surface-container-lowest)',
        animationDelay: `${animationDelay}s`,
        ['--animate-slide-in' as string]: 'slideIn 0.4s ease-out forwards',
        ['--animate-slide-out' as string]: 'slideOut 0.3s ease-in forwards',
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        .animate-slide-out {
          animation: slideOut 0.3s ease-in forwards;
        }
      `}</style>

      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Avatar del usuario */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background:
              gasto.quien === 'el'
                ? 'var(--secondary-container)'
                : 'var(--tertiary-container)',
          }}
        >
          {gasto.quien === 'el' ? avatarEl : avatarElla}
        </div>
        
        <div className="min-w-0 flex-1">
          <p
            className="font-medium truncate"
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

      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="font-bold text-lg"
          style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
        >
          {formatCurrency(gasto.monto)}
        </span>
        
        <button
          onClick={onEditClick}
          className="p-2 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ 
            background: 'transparent',
            color: 'var(--primary)',
          }}
          aria-label="Editar gasto"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <button
          onClick={onDeleteClick}
          disabled={isDeleting}
          className="p-2 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ 
            background: 'transparent',
            color: 'var(--error)',
          }}
          aria-label="Eliminar gasto"
        >
          {isDeleting ? (
            <span className="w-5 h-5 border-2 border-error border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 7L18.1327 19.1425C18.0573 20.8857 16.8029 22.2435 15.0643 22.1052L8.9133 21.0193C7.14189 20.8783 5.60101 19.3292 5.49236 17.5545L5.15894 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 17V13M14 17V13M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M2 7H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}