'use client'
import { useEffect, useState, FormEvent } from 'react'
import { WeddingConfig } from '@/lib/types'
import { VN_BANKS } from '@/lib/vietqr'

const BANK_OPTIONS = Object.entries(VN_BANKS).map(([code, name]) => ({ code, name }))

const inputCls = 'w-full border border-[#E4D8C6] rounded-lg px-3 py-2 font-body text-sm text-dark bg-white focus:outline-none focus:border-burg focus:ring-1 focus:ring-burg'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block font-body text-xs font-medium text-mid uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function ConfigForm() {
  const [config, setConfig] = useState<Partial<WeddingConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [musicFile, setMusicFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then((d) => { setConfig(d); setLoading(false) })
  }, [])

  function set(key: keyof WeddingConfig, value: string | null) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (musicFile) {
      const fd = new FormData()
      fd.append('file', musicFile)
      const res = await fetch('/api/upload/music', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        config.music_url = url
      }
    }

    const res = await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (res.ok) setSaved(true)
    setSaving(false)
  }

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <form onSubmit={handleSave} className="py-4 space-y-3">
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">Cô dâu & Chú rể</h3>
        <Field label="Tên chú rể">
          <input className={inputCls} value={config.groom_name ?? ''} onChange={(e) => set('groom_name', e.target.value)} />
        </Field>
        <Field label="Tên cô dâu">
          <input className={inputCls} value={config.bride_name ?? ''} onChange={(e) => set('bride_name', e.target.value)} />
        </Field>
        <Field label="Ngày & giờ cưới">
          <input type="datetime-local" className={inputCls}
            value={config.wedding_date ? config.wedding_date.slice(0, 16) : ''}
            onChange={(e) => set('wedding_date', e.target.value ? e.target.value + ':00+07:00' : null)} />
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">Địa điểm</h3>
        <Field label="Tên nhà hàng / trung tâm">
          <input className={inputCls} value={config.venue_name ?? ''} onChange={(e) => set('venue_name', e.target.value)} />
        </Field>
        <Field label="Địa chỉ">
          <input className={inputCls} value={config.venue_address ?? ''} onChange={(e) => set('venue_address', e.target.value)} />
        </Field>
        <Field label="Google Maps Embed URL">
          <input className={inputCls} value={config.maps_url ?? ''} onChange={(e) => set('maps_url', e.target.value || null)} placeholder="https://www.google.com/maps/embed?..." />
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">Thêm thông tin</h3>
        <Field label="Trang phục (tuỳ chọn)">
          <input className={inputCls} value={config.dresscode ?? ''} onChange={(e) => set('dresscode', e.target.value || null)} />
        </Field>
        <Field label="Ghi chú (tuỳ chọn)">
          <textarea className={inputCls} rows={2} value={config.extra_notes ?? ''} onChange={(e) => set('extra_notes', e.target.value || null)} />
        </Field>
      </div>

      {[1, 2].map((n) => {
        const code = config[`bank${n}_code` as keyof WeddingConfig] as string ?? ''
        const account = config[`bank${n}_account` as keyof WeddingConfig] as string ?? ''
        const holder = config[`bank${n}_holder` as keyof WeddingConfig] as string ?? ''
        return (
          <div key={n} className="bg-white rounded-xl p-4">
            <h3 className="font-display text-base text-dark mb-3">
              Tài khoản ngân hàng {n}{n === 2 ? ' (tuỳ chọn)' : ''}
            </h3>
            <Field label="Ngân hàng">
              <select className={inputCls} value={code} onChange={(e) => set(`bank${n}_code` as keyof WeddingConfig, e.target.value || null)}>
                <option value="">— Chọn ngân hàng —</option>
                {BANK_OPTIONS.map(({ code: c, name }) => (
                  <option key={c} value={c}>{name} ({c})</option>
                ))}
              </select>
            </Field>
            <Field label="Số tài khoản">
              <input className={inputCls} value={account} onChange={(e) => set(`bank${n}_account` as keyof WeddingConfig, e.target.value || null)} />
            </Field>
            <Field label="Tên chủ tài khoản">
              <input className={inputCls} value={holder} onChange={(e) => set(`bank${n}_holder` as keyof WeddingConfig, e.target.value || null)} />
            </Field>
          </div>
        )
      })}

      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">Nhạc nền</h3>
        {config.music_url && (
          <p className="font-body text-xs text-soft mb-2">
            Hiện tại: <a href={config.music_url} target="_blank" rel="noopener noreferrer" className="text-burg underline">Nghe thử</a>
          </p>
        )}
        <Field label="Upload nhạc mới (MP3, tối đa 20 MB)">
          <input type="file" accept="audio/mpeg,audio/mp3" className={inputCls} onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)} />
        </Field>
      </div>

      <button type="submit" disabled={saving}
        className="w-full bg-burg text-cream font-body font-medium py-3 rounded-xl hover:bg-burg-2 transition-colors disabled:opacity-60">
        {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
      </button>
    </form>
  )
}
