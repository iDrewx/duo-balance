'use client'

import { useEffect } from 'react'
import { UserRole } from '@/types'
import { useUserSettings } from '@/context/UserSettingsContext'

// Storage key para último perfil usado
const PROFILE_KEY = 'duobalance-last-profile'

interface UserSelectorProps {
  onSelect: (role: UserRole) => void
}

export default function UserSelector({ onSelect }: UserSelectorProps) {
  const { settings, isLoading } = useUserSettings()

  // Guardar último perfil usado
  const handleSelect = (role: UserRole) => {
    localStorage.setItem(PROFILE_KEY, role)
    onSelect(role)
  }

  // Si está cargando, mostrar pantalla de carga
  if (isLoading || !settings) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--surface)]"
      >
        <div className="text-center">
          <div 
            className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  const { nombre_el, nombre_ella, avatar_el, avatar_ella, assigned_profile } = settings

  // Si hay un perfil asignado, mostrar solo ese perfil
  if (assigned_profile) {
    const isEl = assigned_profile === 'el'
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--surface)]"
      >
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <h1 
            className="text-4xl font-bold mb-3"
            style={{ 
              color: 'var(--on-surface)', 
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '-0.03em'
            }}
          >
            DuoBalance
          </h1>
          <p 
            className="text-base"
            style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
          >
            Your shared sanctuary
          </p>
        </div>

        {/* Main Card - Single Profile */}
        <div 
          className="max-w-md w-full bg-[var(--surface-container-lowest)] p-8"
          style={{ 
            borderRadius: '32px', 
            boxShadow: '0 24px 80px rgba(26, 28, 28, 0.08)'
          }}
        >
          <h2 
            className="text-2xl font-semibold text-center mb-8"
            style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
          >
            Hola, {isEl ? nombre_el : nombre_ella}
          </h2>
          
          <button
            onClick={() => handleSelect(assigned_profile)}
            className="flex flex-col items-center gap-5 p-8 transition-all group w-full"
            style={{ 
              background: 'var(--surface-container-low)',
              borderRadius: '24px'
            }}
          >
            {/* Avatar */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
              style={{ 
                background: isEl ? 'var(--secondary-container)' : 'var(--tertiary-container)'
              }}
            >
              {isEl ? avatar_el : avatar_ella}
            </div>
            <div className="text-center">
              <span 
                className="block text-xl font-semibold"
                style={{ color: isEl ? 'var(--secondary)' : 'var(--tertiary)', fontFamily: 'Manrope, sans-serif' }}
              >
                {isEl ? nombre_el : nombre_ella}
              </span>
              <span 
                className="text-sm"
                style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
              >
                Mi perfil
              </span>
            </div>
            <span 
              className="text-sm font-medium px-6 py-3 rounded-full w-full text-center transition-all"
              style={{ 
                background: isEl ? 'var(--secondary)' : 'var(--tertiary)',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Entrar
            </span>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-sm" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
          © 2024 DuoBalance
        </p>
      </div>
    )
  }

  // Sin perfil asignado - mostrar ambos perfiles
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--surface)]"
    >
      {/* Logo / Header */}
      <div className="text-center mb-10">
        <h1 
          className="text-4xl font-bold mb-3"
          style={{ 
            color: 'var(--on-surface)', 
            fontFamily: 'Manrope, sans-serif',
            letterSpacing: '-0.03em'
          }}
        >
          DuoBalance
        </h1>
        <p 
          className="text-base"
          style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
        >
          Your shared sanctuary
        </p>
      </div>

      {/* Main Card */}
      <div 
        className="max-w-md w-full bg-[var(--surface-container-lowest)] p-8"
        style={{ 
          borderRadius: '32px', 
          boxShadow: '0 24px 80px rgba(26, 28, 28, 0.08)'
        }}
      >
        <h2 
          className="text-2xl font-semibold text-center mb-8"
          style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
        >
          Seleccionar perfil
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* El */}
          <button
            onClick={() => handleSelect('el')}
            className="flex flex-col items-center gap-5 p-8 transition-all group"
            style={{ 
              background: 'var(--surface-container-low)',
              borderRadius: '24px'
            }}
          >
            {/* Avatar */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
              style={{ 
                background: 'var(--secondary-container)'
              }}
            >
              {avatar_el}
            </div>
            <div className="text-center">
              <span 
                className="block text-xl font-semibold"
                style={{ color: 'var(--secondary)', fontFamily: 'Manrope, sans-serif' }}
              >
                {nombre_el}
              </span>
              <span 
                className="text-sm"
                style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
              >
                Mi perfil
              </span>
            </div>
            <span 
              className="text-sm font-medium px-6 py-3 rounded-full w-full text-center transition-all"
              style={{ 
                background: 'var(--secondary)',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Entrar
            </span>
          </button>

          {/* Ella */}
          <button
            onClick={() => handleSelect('ella')}
            className="flex flex-col items-center gap-5 p-8 transition-all group"
            style={{ 
              background: 'var(--surface-container-low)',
              borderRadius: '24px'
            }}
          >
            {/* Avatar */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
              style={{ 
                background: 'var(--tertiary-container)'
              }}
            >
              {avatar_ella}
            </div>
            <div className="text-center">
              <span 
                className="block text-xl font-semibold"
                style={{ color: 'var(--tertiary)', fontFamily: 'Manrope, sans-serif' }}
              >
                {nombre_ella}
              </span>
              <span 
                className="text-sm"
                style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}
              >
                Mi perfil
              </span>
            </div>
            <span 
              className="text-sm font-medium px-6 py-3 rounded-full w-full text-center transition-all"
              style={{ 
                background: 'var(--tertiary)',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Entrar
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-10 text-sm" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
        © 2024 DuoBalance
      </p>
    </div>
  )
}