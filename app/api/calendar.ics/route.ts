import { NextResponse } from 'next/server'
import { createServerAnonClient } from '@/lib/supabase/server'
import type { WeddingConfig } from '@/lib/types'

export const dynamic = 'force-dynamic'

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

function pad(n: number) { return String(n).padStart(2, '0') }

function toIcsDate(d: Date) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) + 'Z'
  )
}

function escapeIcs(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET() {
  const config = await getConfig()
  const start = new Date(config?.wedding_date ?? '2026-07-03T11:00:00+07:00')
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)

  const bride = config?.bride_name ?? 'Ái Nhãn'
  const groom = config?.groom_name ?? 'Ngọc Sơn'
  const venueName = config?.venue_name ?? ''
  const venueAddr = config?.venue_address ?? ''
  const location = [venueName, venueAddr].filter(Boolean).join(', ')

  const summary = `Lễ Thành Hôn ${bride} & ${groom}`
  const description = `Trân trọng kính mời quý vị đến dự lễ thành hôn của ${bride} & ${groom}.`
  const uid = `wedding-${start.getTime()}@invite`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invite//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs('Nhắc nhở: ' + summary + ' ngày mai!')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(lines, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="wedding.ics"',
      'Cache-Control': 'no-store',
    },
  })
}
