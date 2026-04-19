'use client'

interface ConfirmModalProps {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  show,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!show) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div 
        className="bg-[var(--surface-container-lowest)] p-6 max-w-sm w-full"
        style={{ borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ 
              background: variant === 'danger' ? 'var(--error-container)' : 'var(--primary-container)' 
            }}
          >
            {variant === 'danger' ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--error)' }}>
                <path d="M19 7L18.1327 19.1425C18.0573 20.8857 16.8029 22.2435 15.0643 22.1052L8.9133 21.0193C7.14189 20.8783 5.60101 19.3292 5.49236 17.5545L5.15894 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 17V13M14 17V13M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M2 7H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary)' }}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
          >
            {title}
          </h3>
          <p 
            className="text-sm"
            style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
          >
            {message}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full font-medium"
            style={{ 
              background: 'var(--surface-container-low)',
              color: 'var(--on-surface)',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full font-medium"
            style={{ 
              background: variant === 'danger' ? 'var(--error)' : 'var(--primary)',
              color: 'white',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
