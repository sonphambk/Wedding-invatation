import { createServerAnonClient } from '@/lib/supabase/server'
import type { WeddingConfig } from '@/lib/types'
import EnvelopeIntro from '@/components/guest/EnvelopeIntro'
import GuestInvitation from '@/components/guest/GuestInvitation'

export const dynamic = 'force-dynamic'

async function getConfig(): Promise<WeddingConfig | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes('placeholder')) return null
  try {
    const supabase = await createServerAnonClient()
    const { data, error } = await supabase
      .from('wedding_config')
      .select('*')
      .eq('id', 1)
      .single()
    if (error || !data) return null
    return data as WeddingConfig
  } catch {
    return null
  }
}

interface PageProps {
  searchParams: Promise<{ to?: string | string[] }>
}

export default async function Home({ searchParams }: PageProps) {
  const config = await getConfig()
  const sp = await searchParams
  const toRaw = Array.isArray(sp.to) ? sp.to[0] : sp.to
  const guestName = toRaw?.trim().slice(0, 80) ?? ''

  const groomName = config?.groom_name ?? 'Ngọc Sơn'
  const brideName = config?.bride_name ?? 'Ái Nhãn'

  return (
    <>
      <EnvelopeIntro groomName={groomName} brideName={brideName} guestName={guestName} />
      <GuestInvitation config={config} guestName={guestName} />
    </>
  )
}
