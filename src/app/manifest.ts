import { NextRequest, NextResponse } from 'next/server'

const manifest = {
  name: 'DuoBalance',
  short_name: 'DuoBalance',
  description: 'Control de gastos compartidos para dos',
  start_url: '/',
  display: 'standalone',
  background_color: '#f9f9f9',
  theme_color: '#630ed4',
  icons: [
    {
      src: '/file.svg',
      sizes: 'any',
      type: 'image/svg+xml'
    }
  ]
}

export function GET() {
  return NextResponse.json(manifest)
}