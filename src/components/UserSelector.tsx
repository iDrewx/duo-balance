'use client'

import { useEffect, useState } from 'react'
import { UserRole } from '@/types'

// Storage keys
const PROFILE_KEY = 'duobalance-last-profile'
const NOMBRE_KEY = 'duobalance-nombre'
const AVATAR_KEY = 'duobalance-avatar'

interface UserSelectorProps {
  onSelect: (role: UserRole) => void
}

export default function UserSelector({ onSelect }: UserSelectorProps) {
  const [nombreEl, setNombreEl] = useState('André')
  const [nombreElla, setNombreElla] = useState('Diana')
  const [avatarEl, setAvatarEl] = useState('👨')
  const [avatarElla, setAvatarElla] = useState('👩')

  useEffect(() => {
    // Cargar nombres y avatares desde localStorage
    const storedNombreEl = localStorage.getItem(`${NOMBRE_KEY}-el`)
    const storedNombreElla = localStorage.getItem(`${NOMBRE_KEY}-ella`)
    const storedAvatarEl = localStorage.getItem(`${AVATAR_KEY}-el`)
    const storedAvatarElla = localStorage.getItem(`${AVATAR_KEY}-ella`)

    if (storedNombreEl) setNombreEl(storedNombreEl)
    if (storedNombreElla) setNombreElla(storedNombreElla)
    if (storedAvatarEl) setAvatarEl(storedAvatarEl)
    if (storedAvatarElla) setAvatarElla(storedAvatarElla)

    // Guardar valores por defecto si no existen
    if (!storedNombreEl) localStorage.setItem(`${NOMBRE_KEY}-el`, 'André')
    if (!storedNombreElla) localStorage.setItem(`${NOMBRE_KEY}-ella`, 'Diana')
    if (!storedAvatarEl) localStorage.setItem(`${AVATAR_KEY}-el`, '👨')
    if (!storedAvatarElla) localStorage.setItem(`${AVATAR_KEY}-ella`, '👩')
  }, [])

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: '#f9f9f9' }}
    >
      {/* Logo / Header */}
      <div className="text-center mb-10">
        <h1 
          className="text-4xl font-bold mb-3"
          style={{ 
            color: '#1a1c1c', 
            fontFamily: 'Manrope, sans-serif',
            letterSpacing: '-0.03em'
          }}
        >
          DuoBalance
        </h1>
        <p 
          className="text-base"
          style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}
        >
          Your shared sanctuary
        </p>
      </div>

      {/* Main Card */}
      <div 
        className="max-w-md w-full bg-white p-8"
        style={{ 
          borderRadius: '32px', 
          boxShadow: '0 24px 80px rgba(26, 28, 28, 0.08)'
        }}
      >
        <h2 
          className="text-2xl font-semibold text-center mb-8"
          style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}
        >
          Seleccionar perfil
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* El */}
          <button
            onClick={() => onSelect('el')}
            className="flex flex-col items-center gap-5 p-8 transition-all group"
            style={{ 
              background: '#f3f3f3',
              borderRadius: '24px'
            }}
          >
            {/* Avatar */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
              style={{ 
                background: '#82f5c1'
              }}
            >
              {avatarEl}
            </div>
            <div className="text-center">
              <span 
                className="block text-xl font-semibold"
                style={{ color: '#006c4a', fontFamily: 'Manrope, sans-serif' }}
              >
                {nombreEl}
              </span>
              <span 
                className="text-sm"
                style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}
              >
                Mi perfil
              </span>
            </div>
            <span 
              className="text-sm font-medium px-6 py-3 rounded-full w-full text-center transition-all"
              style={{ 
                background: '#006c4a',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Entrar
            </span>
          </button>

          {/* Ella */}
          <button
            onClick={() => onSelect('ella')}
            className="flex flex-col items-center gap-5 p-8 transition-all group"
            style={{ 
              background: '#f3f3f3',
              borderRadius: '24px'
            }}
          >
            {/* Avatar */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
              style={{ 
                background: '#ffd9e2'
              }}
            >
              {avatarElla}
            </div>
            <div className="text-center">
              <span 
                className="block text-xl font-semibold"
                style={{ color: '#9d0050', fontFamily: 'Manrope, sans-serif' }}
              >
                {nombreElla}
              </span>
              <span 
                className="text-sm"
                style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}
              >
                Mi perfil
              </span>
            </div>
            <span 
              className="text-sm font-medium px-6 py-3 rounded-full w-full text-center transition-all"
              style={{ 
                background: '#9d0050',
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
      <p className="mt-10 text-sm" style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>
        © 2024 DuoBalance
      </p>
    </div>
  )
}