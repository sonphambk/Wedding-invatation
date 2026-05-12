import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('wishes')
    .select('id, guest_name, message, likes, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { guest_name, message } = await request.json()

  if (!guest_name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })
  }
  if (guest_name.length > 100 || message.length > 500) {
    return NextResponse.json({ error: 'Nội dung quá dài' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('wishes')
    .insert({ guest_name: guest_name.trim(), message: message.trim() })
    .select('id, guest_name, message, likes, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
