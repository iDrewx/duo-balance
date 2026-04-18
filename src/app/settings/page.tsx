'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'
import { UserRole } from '@/types'

const AVATARES = [
  '👨', '👩', '🧑', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰',
  '🧔', '👴', '👵', '👸', '🤴', '🦸', '🦹',
  '🧙', '🧚', '🧛', '🧜', '🧝', '🧞',
  '😀', '😎', '🤓', '🧐', '😇', '🤗',
  '🐱', '🐶', '🐼', '🦊', '🐻', '🐨',
]

export default function SettingsPage() {
  const router = useRouter()
  const { user: authUser, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { settings, isLoading: settingsLoading, updateSettings } = useUserSettings()
  
  const [selectedUser, setSelectedUser] = useState<UserRole>('el')
  const [nombre, setNombre] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Cargar configuración cuando esté disponible
  useEffect(() => {
    if (settings && !settingsLoading) {
      // Determinar último perfil usado o default
      const lastProfile = localStorage.getItem('duobalance-last-profile')
      const perfilInicial = (lastProfile === 'el' || lastProfile === 'ella') ? lastProfile : 'el'
      
      setSelectedUser(perfilInicial as UserRole)
      setNombre(perfilInicial === 'el' ? settings.nombre_el : settings.nombre_ella)
      setAvatar(perfilInicial === 'el' ? settings.avatar_el : settings.avatar_ella)
    }
  }, [settings, settingsLoading])

  // Guardar último perfil usado cuando cambia
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem('duobalance-last-profile', selectedUser)
    }
  }, [selectedUser])

  // Actualizar nombre/avatar cuando cambia el selectedUser
  useEffect(() => {
    if (settings) {
      if (selectedUser === 'el') {
        setNombre(settings.nombre_el)
        setAvatar(settings.avatar_el)
      } else {
        setNombre(settings.nombre_ella)
        setAvatar(settings.avatar_ella)
      }
    }
  }, [selectedUser, settings])

  const handleSave = async () => {
    if (!selectedUser || isSaving) return
    
    setIsSaving(true)
    
    const updates = selectedUser === 'el' 
      ? { nombre_el: nombre, avatar_el: avatar }
      : { nombre_ella: nombre, avatar_ella: avatar }
    
    const success = await updateSettings(updates)
    setIsSaving(false)
    
    if (success) {
      alert('¡Cambios guardados!')
    } else {
      alert('Error al guardar. Intenta de nuevo.')
    }
  }

  const handleAssignProfile = async (profile: UserRole | null) => {
    const success = await updateSettings({ assigned_profile: profile })
    
    if (success) {
      alert(profile 
        ? `✅ Perfil '${profile === 'el' ? settings?.nombre_el : settings?.nombre_ella}' asignado. Este usuario verá solo su perfil al entrar.`
        : '✅ Asignación de perfil eliminada.'
      )
    } else {
      alert('Error al guardar. Intenta de nuevo.')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (settingsLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <p style={{ color: 'var(--on-surface-variant)' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Header */}
      <header 
        className="bg-[var(--surface-container-lowest)] sticky top-0 z-10"
        style={{ boxShadow: '0 4px 20px rgba(26, 28, 28, 0.04)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="var(--on-surface-variant)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }} className="hidden sm:inline">Volver</span>
          </button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}>
            Configuración
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Modo Oscuro */}
        <div 
          className="bg-[var(--surface-container-lowest)] p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}>
            Apariencia
          </h2>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all"
            style={{ 
              background: 'var(--surface-container-low)',
              color: 'var(--on-surface)'
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{isDark ? '🌙' : '☀️'}</span>
              <span style={{ fontFamily: 'Inter, sans-serif' }}>
                {isDark ? 'Modo Oscuro' : 'Modo Claro'}
              </span>
            </div>
            <div 
              className="w-14 h-8 rounded-full p-1 transition-colors"
              style={{ 
                background: isDark ? 'var(--primary)' : '#ccc3d8'
              }}
            >
              <div 
                className="w-6 h-6 rounded-full transition-transform"
                style={{ 
                  background: '#fff',
                  transform: isDark ? 'translateX(24px)' : 'translateX(0)'
                }}
              />
            </div>
          </button>
        </div>

        {/* Asignar perfil al usuario actual */}
        <div 
          className="bg-[var(--surface-container-lowest)] p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}>
            Restringir acceso
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
            Asigna un perfil para que este usuario solo vea el suyo al iniciar sesión.
          </p>
          
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => handleAssignProfile('el')}
              className="flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-medium transition-all text-sm sm:text-base"
              style={{ 
                background: settings.assigned_profile === 'el' ? 'var(--secondary-container)' : 'var(--surface-container-low)',
                color: settings.assigned_profile === 'el' ? 'var(--secondary)' : 'var(--on-surface-variant)',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              {settings.nombre_el}
            </button>
            <button
              onClick={() => handleAssignProfile('ella')}
              className="flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-medium transition-all text-sm sm:text-base"
              style={{ 
                background: settings.assigned_profile === 'ella' ? 'var(--tertiary-container)' : 'var(--surface-container-low)',
                color: settings.assigned_profile === 'ella' ? 'var(--tertiary)' : 'var(--on-surface-variant)',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              {settings.nombre_ella}
            </button>
            {settings.assigned_profile && (
              <button
                onClick={() => handleAssignProfile(null)}
                className="px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-medium transition-all"
                style={{ 
                  background: 'var(--error-container)',
                  color: 'var(--error)',
                  fontFamily: 'Manrope, sans-serif'
                }}
              >
                ✕
              </button>
            )}
          </div>
          
          {settings.assigned_profile && (
            <p className="mt-3 text-sm" style={{ color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>
              ✓ Perfil '{settings.assigned_profile === 'el' ? settings.nombre_el : settings.nombre_ella}' asignado
            </p>
          )}
        </div>

        {/* Selector de perfil */}
        <div 
          className="bg-[var(--surface-container-lowest)] p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}>
            ¿Qué perfil quieres configurar?
          </h2>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setSelectedUser('el')}
              className="flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-medium transition-all text-sm sm:text-base"
              style={{ 
                background: selectedUser === 'el' ? 'var(--secondary-container)' : 'var(--surface-container-low)',
                color: selectedUser === 'el' ? 'var(--secondary)' : 'var(--on-surface-variant)',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              {settings.nombre_el}
            </button>
            <button
              onClick={() => setSelectedUser('ella')}
              className="flex-1 py-3 sm:py-4 px-2 sm:px-4 rounded-xl font-medium transition-all text-sm sm:text-base"
              style={{ 
                background: selectedUser === 'ella' ? 'var(--tertiary-container)' : 'var(--surface-container-low)',
                color: selectedUser === 'ella' ? 'var(--tertiary)' : 'var(--on-surface-variant)',
                fontFamily: 'Manrope, sans-serif'
              }}
            >
              {settings.nombre_ella}
            </button>
          </div>
        </div>

        {/* Nombre */}
        <div 
          className="bg-[var(--surface-container-lowest)] p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}>
            Nombre
          </h2>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-5 py-4 text-base"
            style={{ 
              background: 'var(--surface-container-low)',
              borderRadius: '16px',
              border: '2px solid transparent',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              color: 'var(--on-surface)'
            }}
            placeholder="Tu nombre"
          />
        </div>

        {/* Avatar */}
        <div 
          className="bg-[var(--surface-container-lowest)] p-6"
          style={{ borderRadius: '24px', boxShadow: '0 12px 40px rgba(26, 28, 28, 0.06)' }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}>
            Avatar
          </h2>
          
          {/* Avatar actual grande */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
              style={{ 
                background: selectedUser === 'el' ? 'var(--secondary-container)' : 'var(--tertiary-container)'
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
                  background: avatar === a ? (selectedUser === 'el' ? 'var(--secondary-container)' : 'var(--tertiary-container)') : 'var(--surface-container-low)',
                  border: avatar === a ? `2px solid ${selectedUser === 'el' ? 'var(--secondary)' : 'var(--tertiary)'}` : '2px solid transparent'
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
          disabled={isSaving}
          className="w-full py-4 text-base font-semibold rounded-full disabled:opacity-50"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            color: 'var(--on-primary)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {/* Cerrar sesión */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 text-base font-semibold rounded-full"
          style={{ 
            background: 'var(--error-container)',
            color: 'var(--error)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Cerrar sesión
        </button>
      </main>
    </div>
  )
}