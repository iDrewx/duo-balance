'use client'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar por concepto...',
}: SearchBarProps) {
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        background: 'var(--surface-container-low)',
        border: '1px solid var(--outline-variant)',
        borderRadius: '16px',
        color: 'var(--on-surface)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <input
        type="text"
        role="searchbox"
        aria-label="Buscar gastos por concepto"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent py-3 outline-none"
        style={{
          color: 'var(--on-surface)',
          fontFamily: 'Inter, sans-serif',
        }}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="p-1 rounded-full transition-colors"
          style={{
            color: 'var(--on-surface-variant)',
            background: 'transparent',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
