import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
      }
    }
  }

  // Error, redirect a login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}