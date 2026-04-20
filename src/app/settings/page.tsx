'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useUserSettings } from '@/context/UserSettingsContext'
import { UserRole } from '@/types'
import { generateRandomSeeds, getAvatarUrl } from '@/lib/dicebear'

export default function SettingsPage() {
  const router = useRouter()
  const { user: authUser, signOut } = useAuth()
  const { theme, setTheme, isDark } = useTheme()
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const { settings, isLoading: settingsLoading, updateSettings } = useUserSettings()
  
  const [selectedUser, setSelectedUser] = useState<UserRole>('el')
  const [nombre, setNombre] = useState('')
  const [avatarSeed, setAvatarSeed] = useState('')
  const [availableSeeds, setAvailableSeeds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null)
  const [confirmAssign, setConfirmAssign] = useState<{ show: boolean; profile: UserRole | null }>({ show: false, profile: null })

  const handleAssignButtonClick = (profile: UserRole | null) => {
    setConfirmAssign({ show: true, profile })
  }

  const confirmAssignAction = async () => {
    const { profile } = confirmAssign
    setConfirmAssign({ show: false, profile: null })
    await handleAssignProfile(profile)
  }

  const cancelAssign = () => {
    setConfirmAssign({ show: false, profile: null })
  }

  // Cargar configuración cuando esté disponible
  useEffect(() => {
    if (settings && !settingsLoading) {
      // Determinar último perfil usado o default
      const lastProfile = localStorage.getItem('duobalance-last-profile')
      const perfilInicial = (lastProfile === 'el' || lastProfile === 'ella') ? lastProfile : 'el'
      
      setSelectedUser(perfilInicial as UserRole)
      setNombre(perfilInicial === 'el' ? settings.nombre_el : settings.nombre_ella)
      setAvatarSeed(perfilInicial === 'el' ? settings.avatar_el_seed : settings.avatar_ella_seed)
      // Generar seeds disponibles
      setAvailableSeeds(generateRandomSeeds(10))
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
        setAvatarSeed(settings.avatar_el_seed)
      } else {
        setNombre(settings.nombre_ella)
        setAvatarSeed(settings.avatar_ella_seed)
      }
    }
  }, [selectedUser, settings])

  // Función para regenerar seeds
  const handleRegenerateSeeds = () => {
    setAvailableSeeds(generateRandomSeeds(10))
  }

  const handleSave = async () => {
    if (!selectedUser || isSaving) return
    
    setIsSaving(true)
    
    const updates = selectedUser === 'el' 
      ? { nombre_el: nombre, avatar_el_seed: avatarSeed }
      : { nombre_ella: nombre, avatar_ella_seed: avatarSeed }
    
    const success = await updateSettings(updates)
    setIsSaving(false)
    setSaveSuccess(success)
    
    // Ocultar mensaje después de 2 segundos
    if (success) {
      setTimeout(() => setSaveSuccess(null), 2000)
    }
  }

  const handleAssignProfile = async (profile: UserRole | null) => {
    const success = await updateSettings({ assigned_profile: profile })
    
    if (success) {
      // Silent success - user sees the change in UI
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
          
          {/* Dropdown selector de tema */}
          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all"
              style={{ 
                background: 'var(--surface-container-low)',
                color: 'var(--on-surface)'
              }}
            >
              <div className="flex items-center gap-4">
                {theme === 'dark' ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : theme === 'light' ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  {theme === 'dark' ? 'Modo Oscuro' : theme === 'light' ? 'Modo Claro' : 'Sistema'}
                </span>
              </div>
              <svg 
                className="w-5 h-5 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ transform: showThemeDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {showThemeDropdown && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl z-10 overflow-hidden"
                style={{ 
                  background: 'var(--surface-container-lowest)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                <button
                  onClick={() => { setTheme('light'); setShowThemeDropdown(false) }}
                  className="w-full flex items-center gap-3 px-6 py-3 transition-all"
                  style={{ 
                    background: theme === 'light' ? 'var(--primary-container)' : 'transparent',
                    color: theme === 'light' ? 'var(--primary)' : 'var(--on-surface)'
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Claro</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setShowThemeDropdown(false) }}
                  className="w-full flex items-center gap-3 px-6 py-3 transition-all"
                  style={{ 
                    background: theme === 'dark' ? 'var(--primary-container)' : 'transparent',
                    color: theme === 'dark' ? 'var(--primary)' : 'var(--on-surface)'
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Oscuro</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setShowThemeDropdown(false) }}
                  className="w-full flex items-center gap-3 px-6 py-3 transition-all"
                  style={{ 
                    background: theme === 'system' ? 'var(--primary-container)' : 'transparent',
                    color: theme === 'system' ? 'var(--primary)' : 'var(--on-surface)'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Sistema</span>
                </button>
              </div>
            )}
          </div>
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
              onClick={() => handleAssignButtonClick('el')}
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
              onClick={() => handleAssignButtonClick('ella')}
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
                onClick={() => handleAssignButtonClick(null)}
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
          <div className="flex justify-center mb-4">
            <img
              src={getAvatarUrl(avatarSeed)}
              alt="Avatar actual"
              className="w-24 h-24 rounded-full"
              style={{ 
                background: selectedUser === 'el' ? 'var(--secondary-container)' : 'var(--tertiary-container)'
              }}
            />
          </div>

          {/* Botón regenerar */}
          <button
            onClick={handleRegenerateSeeds}
            className="w-full py-2 mb-4 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ 
              background: 'var(--surface-container-low)',
              color: 'var(--on-surface)',
              border: '1px solid var(--outline)'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerar avatares
          </button>

          {/* Grid de avatares DiceBear */}
          <div className="grid grid-cols-5 gap-2">
            {availableSeeds.map((seed) => (
              <button
                key={seed}
                onClick={() => setAvatarSeed(seed)}
                className="w-full aspect-square rounded-lg flex items-center justify-center transition-all overflow-hidden"
                style={{ 
                  background: avatarSeed === seed 
                    ? (selectedUser === 'el' ? 'var(--secondary-container)' : 'var(--tertiary-container)') 
                    : 'var(--surface-container-low)',
                  border: avatarSeed === seed 
                    ? `2px solid ${selectedUser === 'el' ? 'var(--secondary)' : 'var(--tertiary)'}` 
                    : '2px solid transparent'
                }}
              >
                <img
                  src={getAvatarUrl(seed)}
                  alt="Avatar opción"
                  className="w-10 h-10"
                />
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

        <ConfirmModal
          show={confirmAssign.show}
          title={`Asignar ${confirmAssign.profile ? (confirmAssign.profile === 'el' ? settings?.nombre_el : settings?.nombre_ella) : ''}?`}
          message={`Este perfil será el único que pueda usar la app.`}
          confirmText="Asignar"
          variant="primary"
          onConfirm={confirmAssignAction}
          onCancel={cancelAssign}
        />

        {/* Pantalla de éxito/error al guardar */}
        {saveSuccess !== null && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSaveSuccess(null)}
          >
            <div 
              className="p-8 rounded-3xl text-center max-w-sm mx-4"
              style={{ background: 'var(--surface-container-high)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {saveSuccess ? (
                <>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--secondary-container)' }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="var(--secondary)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
                  >
                    ¡Cambios guardados!
                  </h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
                    Tu configuración ha sido actualizada.
                  </p>
                </>
              ) : (
                <>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--error-container)' }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="var(--error)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif' }}
                  >
                    Error al guardar
                  </h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontFamily: 'Inter, sans-serif' }}>
                    Intenta de nuevo.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}