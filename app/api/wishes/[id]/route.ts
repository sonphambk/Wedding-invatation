import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const supabase = await createServiceClient()

  // Like: anyone can like
  if (body.like === true) {
    const { data: current } = await supabase
      .from('wishes')
      .select('likes')
      .eq('id', id)
      .single()

    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('wishes')
      .update({ likes: current.likes + 1 })
      .eq('id', id)
      .select('id, likes')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Admin-only: toggle approved
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if ('approved' in body) {
    const { data, error } = await supabase
      .from('wishes')
      .update({ approved: body.approved })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const { error } = await supabase.from('wishes').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
