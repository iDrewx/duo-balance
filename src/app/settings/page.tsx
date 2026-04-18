'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'

const AVATARES = [
  '👨', '👩', '🧑', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰',
  '🧔', '👴', '👵', '👸', '🤴', '🦸', '🦹',
  '🧙', '🧚', '🧛', '🧜', '🧝', '🧞',
  '😀', '😎', '🤓', '🧐', '😇', '🤗',
  '🐱', '🐶', '🐼', '🦊', '🐻', '🐨',
]

const NOMBRE_KEY = 'duobalance-nombre'
const AVATAR_KEY = 'duobalance-avatar'

export default function SettingsPage() {
  const router = useRouter()
  const { user: authUser, signOut } = useAuth()
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null)
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Cargar configuración actual
  useEffect(() => {
    if (!authUser) {
      router.push('/login')
      return
    }

    // Cargar perfiles de localStorage
    const storedNombreEl = localStorage.getItem(`${NOMBRE_KEY}-el`)
    const storedNombreElla = localStorage.getItem(`${NOMBRE_KEY}-ella`)
    const storedAvatarEl = localStorage.getItem(`${AVATAR_KEY}-el`)
    const storedAvatarElla = localStorage.getItem(`${AVATAR_KEY}-ella`)

    // Si existe configuración previa, usarla; si no, usar valores por defecto
    const nombreEl = storedNombreEl || 'André'
    const nombreElla = storedNombreElla || 'Diana'
    const avatarEl = storedAvatarEl || '👨'
    const avatarElla = storedAvatarElla || '👩'

    // Guardar valores por defecto si no existen
    if (!storedNombreEl) localStorage.setItem(`${NOMBRE_KEY}-el`, nombreEl)
    if (!storedNombreElla) localStorage.setItem(`${NOMBRE_KEY}-ella`, nombreElla)
    if (!storedAvatarEl) localStorage.setItem(`${AVATAR_KEY}-el`, avatarEl)
    if (!storedAvatarElla) localStorage.setItem(`${AVATAR_KEY}-ella`, avatarElla)

    setNombre(selectedUser === 'el' ? nombreEl : nombreElla)
    setAvatar(selectedUser === 'el' ? avatarEl : avatarElla)
    setIsLoading(false)
  }, [authUser, router, selectedUser])

  // También inicializar selectedUser desde el primer perfil disponible
  useEffect(() => {
    const storedPerfil = localStorage.getItem('duobalance-last-profile')
    if (storedPerfil === 'el' || storedPerfil === 'ella') {
      setSelectedUser(storedPerfil)
    } else {
      setSelectedUser('el')
    }
  }, [])

  const handleSave = () => {
    if (!selectedUser) return
    
    localStorage.setItem(`${NOMBRE_KEY}-${selectedUser}`, nombre)
    localStorage.setItem(`${AVATAR_KEY}-${selectedUser}`, avatar)
    alert('¡Cambios guardados!')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f9f9' }}>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f9f9f9' }}>
      {/* Header */}
      <header 
        className="bg-white sticky top-0 z-10"
        style={{ boxShadow: '0 4px 20px rgba(26, 28, 28, 0.04)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#4a4455" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}>Volver</span>
          </button>
          <h1 className="text-lg font-bold" style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}>
            Configuración
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Selector de perfil */}
        <div 
          className="bg-white p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}>
            ¿Qué perfil quieres configurar?
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedUser('el')
                setNombre(localStorage.getItem(`${NOMBRE_KEY}-el`) || 'André')
                setAvatar(localStorage.getItem(`${AVATAR_KEY}-el`) || '👨')
              }}
              className="flex-1 py-4 rounded-xl font-medium transition-all"
              style={{ 
                background: selectedUser === 'el' ? '#82f5c1' : '#f3f3f3',
                color: selectedUser === 'el' ? '#006c4a' : '#4a4455',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              André
            </button>
            <button
              onClick={() => {
                setSelectedUser('ella')
                setNombre(localStorage.getItem(`${NOMBRE_KEY}-ella`) || 'Diana')
                setAvatar(localStorage.getItem(`${AVATAR_KEY}-ella`) || '👩')
              }}
              className="flex-1 py-4 rounded-xl font-medium transition-all"
              style={{ 
                background: selectedUser === 'ella' ? '#ffd9e2' : '#f3f3f3',
                color: selectedUser === 'ella' ? '#9d0050' : '#4a4455',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              Diana
            </button>
          </div>
        </div>

        {/* Nombre */}
        <div 
          className="bg-white p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}>
            Nombre
          </h2>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-5 py-4 text-base"
            style={{ 
              background: '#f3f3f3',
              borderRadius: '16px',
              border: '2px solid transparent',
              fontFamily: 'Inter, sans-serif',
              outline: 'none'
            }}
            placeholder="Tu nombre"
          />
        </div>

        {/* Avatar */}
        <div 
          className="bg-white p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#1a1c1c', fontFamily: 'Manrope, sans-serif' }}>
            Avatar
          </h2>
          
          {/* Avatar actual grande */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
              style={{ 
                background: selectedUser === 'el' ? '#82f5c1' : '#ffd9e2'
              }}
            >
              {avatar}
            </div>
          </div>

          {/* Grid de avatares */}
          <div className="grid grid-cols-6 gap-3">
            {AVATARES.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all"
                style={{ 
                  background: avatar === a ? (selectedUser === 'el' ? '#82f5c1' : '#ffd9e2') : '#f3f3f3',
                  border: avatar === a ? `2px solid ${selectedUser === 'el' ? '#006c4a' : '#9d0050'}` : '2px solid transparent'
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          className="w-full py-4 text-base font-semibold rounded-full"
          style={{ 
            background: 'linear-gradient(135deg, #630ed4 0%, #7c3aed 100%)',
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Guardar cambios
        </button>

        {/* Cerrar sesión */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 text-base font-semibold rounded-full"
          style={{ 
            background: '#ffdad6',
            color: '#ba1a1a',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Cerrar sesión
        </button>
      </main>
    </div>
  )
}