import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { DIA_CORTE } from '@/lib/constants'

function getCorteId(fecha: string): string {
  const date = new Date(fecha)
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  
  let mesCorte = month
  let anioCorte = year
  
  if (day < DIA_CORTE) {
    mesCorte = month - 1
    if (mesCorte < 0) {
      mesCorte = 11
      anioCorte = year - 1
    }
  }
  
  return `${anioCorte}-${String(mesCorte + 1).padStart(2, '0')}`
}

function calculatePeriodToClose(): string {
  const today = new Date()
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer()
  
  if (!supabase) {
    return NextResponse.json({ error: 'no_supabase' }, { status: 500 })
  }
  
  try {
    const periodToClose = calculatePeriodToClose()
    
    // Check if period is already closed
    const { data: existing } = await supabase
      .from('periodo_cerrado')
      .select('id')
      .eq('periodo', periodToClose)
      .single()
    
    if (existing) {
      return NextResponse.json({ error: 'already_closed', periodo: periodToClose })
    }
    
    // Get all gastos that are not already closed
    const { data: gastos, error: gastosError } = await supabase
      .from('gastos')
      .select('id, fecha')
      .eq('cerrado', false)
    
    if (gastosError) {
      return NextResponse.json({ error: 'query_error', details: gastosError.message })
    }
    
    // Find gastos that belong to the period to close
    const gastosToClose = gastos?.filter(g => getCorteId(g.fecha) === periodToClose) || []
    const gastoIds = gastosToClose.map(g => g.id)
    
    // Update gastos to mark them as closed
    if (gastoIds.length > 0) {
      const { error: updateError } = await supabase
        .from('gastos')
        .update({ cerrado: true })
        .in('id', gastoIds)
      
      if (updateError) {
        return NextResponse.json({ error: 'update_error', details: updateError.message })
      }
    }
    
    // Insert period closed record
    const { error: insertError } = await supabase
      .from('periodo_cerrado')
      .insert([{
        periodo: periodToClose,
        fecha_cierre: new Date().toISOString()
      }])
    
    if (insertError) {
      return NextResponse.json({ error: 'insert_error', details: insertError.message })
    }
    
    return NextResponse.json({ ok: true, periodo: periodToClose, cerrados: gastoIds.length })
  } catch (err) {
    console.error('Error closing period:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}