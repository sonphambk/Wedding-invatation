import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const BUCKET = 'wedding-music'

export async function POST(request: NextRequest) {
  if (request.cookies.get('admin_session')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as
    | { action: 'sign'; name: string; type?: string }
    | { action: 'finalize'; publicUrl: string }
    | null

  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })

  const supabase = await createServiceClient()

  if (body.action === 'sign') {
    const name = (body.name || '').toLowerCase()
    const type = (body.type || '').toLowerCase()
    const isAudio =
      type.startsWith('audio/') ||
      name.endsWith('.mp3') || name.endsWith('.m4a') ||
      name.endsWith('.wav') || name.endsWith('.ogg')
    if (!isAudio) {
      return NextResponse.json(
        { error: `Định dạng không hợp lệ (type=${type || 'unknown'}, name=${body.name})` },
        { status: 400 }
      )
    }

    const rawExt = name.split('.').pop() || 'mp3'
    const ext = rawExt === 'mpeg' ? 'mp3' : rawExt
    const objectPath = `bgm.${ext}`

    // Remove existing object to allow re-upload (signed URL doesn't support upsert)
    await supabase.storage.from(BUCKET).remove([objectPath]).catch(() => {})

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(objectPath)

    if (error || !data) {
      return NextResponse.json({ error: `Sign failed: ${error?.message}` }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)

    return NextResponse.json({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
    })
  }

  if (body.action === 'finalize') {
    if (!body.publicUrl) return NextResponse.json({ error: 'publicUrl required' }, { status: 400 })
    // Add cache-buster so browsers fetch the new file
    const versionedUrl = `${body.publicUrl}?v=${Date.now()}`
    const { error } = await supabase
      .from('wedding_config')
      .update({ music_url: versionedUrl })
      .eq('id', 1)
    if (error) return NextResponse.json({ error: `DB update failed: ${error.message}` }, { status: 500 })
    return NextResponse.json({ url: versionedUrl }, { status: 200 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
