import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_SIZE = 20 * 1024 * 1024
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3']

export async function POST(request: NextRequest) {
  if (request.cookies.get('admin_session')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only MP3 allowed' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const supabase = await createServiceClient()

  const { error } = await supabase.storage
    .from('wedding-music')
    .upload('bgm.mp3', buffer, { contentType: 'audio/mpeg', upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('wedding-music')
    .getPublicUrl('bgm.mp3')

  await supabase.from('wedding_config').update({ music_url: publicUrl }).eq('id', 1)

  return NextResponse.json({ url: publicUrl }, { status: 201 })
}
