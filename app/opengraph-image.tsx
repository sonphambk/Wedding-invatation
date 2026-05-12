import { ImageResponse } from 'next/og'
import { createServerAnonClient } from '@/lib/supabase/server'
import type { WeddingConfig } from '@/lib/types'

export const runtime = 'nodejs'
export const alt = 'Wedding Invitation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function getConfig(): Promise<WeddingConfig | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes('placeholder')) return null
  try {
    const supabase = await createServerAnonClient()
    const { data } = await supabase.from('wedding_config').select('*').eq('id', 1).single()
    return (data as WeddingConfig) ?? null
  } catch {
    return null
  }
}

export default async function Image() {
  const config = await getConfig()
  const bride = (config?.bride_name ?? 'Ái Nhãn').toUpperCase()
  const groom = (config?.groom_name ?? 'Ngọc Sơn').toUpperCase()
  const d = config?.wedding_date ? new Date(config.wedding_date) : new Date('2026-07-03')
  const dateStr = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#FAF8F3',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 40, left: 40, width: 80, height: 80, borderTop: '2px solid #C9A96E', borderLeft: '2px solid #C9A96E', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: 40, right: 40, width: 80, height: 80, borderBottom: '2px solid #C9A96E', borderRight: '2px solid #C9A96E', opacity: 0.5 }} />

        {/* Watermark 囍 */}
        <div style={{ position: 'absolute', fontSize: 520, color: '#7C1B2B', opacity: 0.05, lineHeight: 1, display: 'flex' }}>囍</div>

        {/* Eyebrow */}
        <div style={{ fontSize: 22, letterSpacing: 12, color: '#7A5555', textTransform: 'uppercase', marginBottom: 30, display: 'flex' }}>
          Trân trọng kính mời
        </div>

        {/* Date stack */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <div style={{
            position: 'absolute',
            fontSize: 180,
            color: '#E0A890',
            opacity: 0.55,
            transform: 'rotate(-6deg)',
            display: 'flex',
            fontStyle: 'italic',
          }}>
            Save the Date
          </div>
          <div style={{ fontSize: 200, color: '#7C1B2B', fontWeight: 300, letterSpacing: -4, display: 'flex', zIndex: 2 }}>
            {dateStr}
          </div>
        </div>

        {/* Rule */}
        <div style={{ width: 100, height: 1, background: '#C9A96E', margin: '20px 0 30px' }} />

        {/* Names */}
        <div style={{ fontSize: 56, color: '#231010', letterSpacing: 8, display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span>{bride}</span>
          <span style={{ color: '#7C1B2B', fontStyle: 'italic', fontSize: 64 }}>&</span>
          <span>{groom}</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
