import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_SIZE = 20 * 1024 * 1024

export async function POST(request: NextRequest) {
  if (request.cookies.get('admin_session')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const name = (file.name || '').toLowerCase()
  const type = (file.type || '').toLowerCase()
  const isAudio = type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.m4a') || name.endsWith('.wav') || name.endsWith('.ogg')
  if (!isAudio) {
    return NextResponse.json({ error: `Định dạng file không hợp lệ (type=${type || 'unknown'}, name=${file.name})` }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File quá lớn (tối đa 20 MB)' }, { status: 400 })
  }

  const ext = name.split('.').pop() || 'mp3'
  const objectName = `bgm.${ext === 'mpeg' ? 'mp3' : ext}`
  const buffer = await file.arrayBuffer()
  const supabase = await createServiceClient()

  const { error: upErr } = await supabase.storage
    .from('wedding-music')
    .upload(objectName, buffer, { contentType: type || 'audio/mpeg', upsert: true })

  if (upErr) {
    return NextResponse.json({ error: `Storage upload failed: ${upErr.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('wedding-music')
    .getPublicUrl(objectName)

  const { error: dbErr } = await supabase
    .from('wedding_config')
    .update({ music_url: publicUrl })
    .eq('id', 1)

  if (dbErr) {
    return NextResponse.json({ error: `DB update failed: ${dbErr.message}`, url: publicUrl }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrl }, { status: 201 })
}
