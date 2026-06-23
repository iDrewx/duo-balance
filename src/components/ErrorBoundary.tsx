'use client'

import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'var(--surface)' }}
        >
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--error-container)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--error)' }}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
            >
              Algo salió mal
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
            >
              Ocurrió un error inesperado. Podés recargar la página para intentar de nuevo.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-6 py-3 rounded-full font-medium"
              style={{
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Recargar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
