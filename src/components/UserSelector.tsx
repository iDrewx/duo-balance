'use client'

import { useEffect, useState } from 'react'
import { UserRole } from '@/types'

// Storage key para recordar el último perfil usado
const PROFILE_KEY = 'duobalance-last-profile'

interface UserSelectorProps {
  onSelect: (role: UserRole) => void
}

export default function UserSelector({ onSelect }: UserSelectorProps) {
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
            {/* Icono usando SVG */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #006c4a 0%, #82f5c1 100%)',
                boxShadow: '0 12px 32px rgba(0, 108, 74, 0.25)'
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="white"/>
                <path d="M12 14C8.67 14 2 15.67 2 19V21H22V19C22 15.67 15.33 14 12 14Z" fill="white"/>
              </svg>
            </div>
            <div className="text-center">
              <span 
                className="block text-xl font-semibold"
                style={{ color: '#006c4a', fontFamily: 'Manrope, sans-serif' }}
              >
                André
              </span>
              <span 
                className="text-sm"
                style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}
              >
                Perfil Verde
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
            {/* Icono usando SVG */}
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #9d0050 0%, #ffd9e2 100%)',
                boxShadow: '0 12px 32px rgba(157, 0, 80, 0.25)'
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="white"/>
                <path d="M12 14C8.67 14 2 15.67 2 19V21H22V19C22 15.67 15.33 14 12 14Z" fill="white"/>
              </svg>
            </div>
            <div className="text-center">
              <span 
                className="block text-xl font-semibold"
                style={{ color: '#9d0050', fontFamily: 'Manrope, sans-serif' }}
              >
                Diana
              </span>
              <span 
                className="text-sm"
                style={{ color: '#4a4455', fontFamily: 'Inter, sans-serif' }}
              >
                Perfil Rosa
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