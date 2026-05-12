import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const BUCKET = 'wedding-photos'

export async function POST(request: NextRequest) {
  if (request.cookies.get('admin_session')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as
    | { action: 'sign'; name: string; type?: string }
    | null

  if (!body || body.action !== 'sign') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = (body.name || '').toLowerCase()
  const type = (body.type || '').toLowerCase()
  const isImage =
    type === 'image/jpeg' || type === 'image/png' || type === 'image/webp' ||
    name.endsWith('.jpg') || name.endsWith('.jpeg') ||
    name.endsWith('.png') || name.endsWith('.webp')
  if (!isImage) {
    return NextResponse.json(
      { error: `Định dạng không hợp lệ (type=${type || 'unknown'}, name=${body.name})` },
      { status: 400 }
    )
  }

  const ext = (name.split('.').pop() || 'jpg').replace('jpeg', 'jpg')
  const objectPath = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const supabase = await createServiceClient()
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
