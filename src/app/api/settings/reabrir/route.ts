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

/**
 * GET: Lista los periodos cerrados disponibles para reabrir
 * POST: Reabre un periodo seleccionado
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServer()

  if (!supabase) {
    return NextResponse.json({ error: 'no_supabase' }, { status: 500 })
  }

  try {
    const { data: periodos, error } = await supabase
      .from('periodo_cerrado')
      .select('periodo, fecha_cierre')
      .order('periodo', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'query_error', details: error.message })
    }

    return NextResponse.json({ periodos: periodos || [] })
  } catch (err) {
    console.error('Error listing periods:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServer()

  if (!supabase) {
    return NextResponse.json({ error: 'no_supabase' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { periodo } = body

    if (!periodo) {
      return NextResponse.json({ error: 'periodo_required' }, { status: 400 })
    }

    // Validar formato YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(periodo)) {
      return NextResponse.json({ error: 'invalid_periodo_format' }, { status: 400 })
    }

    // Verificar que el periodo exista y esté cerrado
    const { data: closedPeriod, error: findError } = await supabase
      .from('periodo_cerrado')
      .select('id')
      .eq('periodo', periodo)
      .single()

    if (findError || !closedPeriod) {
      return NextResponse.json({ error: 'period_not_closed', periodo }, { status: 404 })
    }

    // Buscar los gastos de ese periodo (usando getCorteId para determinar qué gastos pertenecen)
    const { data: allGastos, error: gastosError } = await supabase
      .from('gastos')
      .select('id, fecha, cerrado')
      .eq('cerrado', true)

    if (gastosError) {
      return NextResponse.json({ error: 'query_error', details: gastosError.message })
    }

    // Filtrar los gastos que pertenecen al periodo a reabrir
    const gastosToReopen = allGastos?.filter(g => getCorteId(g.fecha) === periodo) || []
    const gastoIds = gastosToReopen.map(g => g.id)

    // Reabrir los gastos
    if (gastoIds.length > 0) {
      const { error: updateError } = await supabase
        .from('gastos')
        .update({ cerrado: false })
        .in('id', gastoIds)

      if (updateError) {
        return NextResponse.json({ error: 'update_error', details: updateError.message })
      }
    }

    // Eliminar el registro de periodo cerrado
    const { error: deleteError } = await supabase
      .from('periodo_cerrado')
      .delete()
      .eq('periodo', periodo)

    if (deleteError) {
      return NextResponse.json({ error: 'delete_error', details: deleteError.message })
    }

    return NextResponse.json({
      ok: true,
      periodo,
      reabiertos: gastoIds.length
    })
  } catch (err) {
    console.error('Error reopening period:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}