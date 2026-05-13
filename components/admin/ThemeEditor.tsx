// components/admin/ThemeEditor.tsx
'use client'
import { useEffect, useState } from 'react'
import {
  WeddingTheme, DEFAULT_THEME,
  HEADING_FONTS, BODY_FONTS, SCRIPT_FONTS,
} from '@/lib/theme'

const inputCls = 'w-full border border-[#E4D8C6] rounded-lg px-3 py-2 font-body text-sm text-dark bg-white focus:outline-none focus:border-burg focus:ring-1 focus:ring-burg'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block font-body text-xs font-medium text-mid uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

export default function ThemeEditor() {
  const [theme, setTheme] = useState<WeddingTheme>(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => {
        if (d.theme_json) setTheme(d.theme_json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function update<K extends keyof WeddingTheme>(key: K, value: WeddingTheme[K]) {
    setTheme(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function save(themeToSave: WeddingTheme | null) {
    setSaving(true)
    setErrorMsg('')
    const res = await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme_json: themeToSave }),
    })
    if (res.ok) setSaved(true)
    else setErrorMsg(`Lưu thất bại (${res.status})`)
    setSaving(false)
  }

  async function handleReset() {
    setTheme(DEFAULT_THEME)
    await save(null)
  }

  // Scoped CSS vars for the live preview (does NOT affect :root)
  const previewVars = {
    '--font-heading': `'${theme.fontHeading}', serif`,
    '--font-body': `'${theme.fontBody}', sans-serif`,
    '--font-script': `'${theme.fontScript}', cursive`,
    '--color-primary': theme.colorPrimary,
    '--color-accent': theme.colorAccent,
    '--scale-heading': theme.fontSizeHeadingScale,
    '--scale-body': theme.fontSizeBodyScale,
  } as React.CSSProperties

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <div className="py-4 space-y-3">

      {/* Font Family */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">🔤 Font chữ</h3>
        <Field label="Tiêu đề (heading)">
          <select className={inputCls} value={theme.fontHeading} onChange={e => update('fontHeading', e.target.value)}>
            {HEADING_FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
        </Field>
        <Field label="Nội dung (body)">
          <select className={inputCls} value={theme.fontBody} onChange={e => update('fontBody', e.target.value)}>
            {BODY_FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
        </Field>
        <Field label="Chữ thảo (script)">
          <select className={inputCls} value={theme.fontScript} onChange={e => update('fontScript', e.target.value)}>
            {SCRIPT_FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
        </Field>
      </div>

      {/* Font Size Scale */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">📏 Cỡ chữ</h3>
        <Field label={`Tiêu đề — ${theme.fontSizeHeadingScale.toFixed(2)}×`}>
          <input
            type="range" min="0.8" max="1.4" step="0.05"
            value={theme.fontSizeHeadingScale}
            onChange={e => update('fontSizeHeadingScale', parseFloat(e.target.value))}
            className="w-full accent-burg"
          />
          <div className="flex justify-between font-body text-xs text-soft mt-1">
            <span>0.80×</span><span>1.00×</span><span>1.40×</span>
          </div>
        </Field>
        <Field label={`Nội dung — ${theme.fontSizeBodyScale.toFixed(2)}×`}>
          <input
            type="range" min="0.8" max="1.4" step="0.05"
            value={theme.fontSizeBodyScale}
            onChange={e => update('fontSizeBodyScale', parseFloat(e.target.value))}
            className="w-full accent-burg"
          />
          <div className="flex justify-between font-body text-xs text-soft mt-1">
            <span>0.80×</span><span>1.00×</span><span>1.40×</span>
          </div>
        </Field>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">🎨 Màu sắc</h3>
        <Field label="Màu chính">
          <div className="flex items-center gap-3">
            <input
              type="color" value={theme.colorPrimary}
              onChange={e => update('colorPrimary', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-[#E4D8C6] p-0.5 bg-white"
            />
            <span className="font-body text-sm text-mid font-mono">{theme.colorPrimary}</span>
          </div>
        </Field>
        <Field label="Màu điểm nhấn (vàng)">
          <div className="flex items-center gap-3">
            <input
              type="color" value={theme.colorAccent}
              onChange={e => update('colorAccent', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-[#E4D8C6] p-0.5 bg-white"
            />
            <span className="font-body text-sm text-mid font-mono">{theme.colorAccent}</span>
          </div>
        </Field>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">👁 Xem trước</h3>
        <div style={previewVars} className="border border-[#E4D8C6] rounded-lg p-5 bg-[#FAF6EE] text-center">
          <p style={{
            fontFamily: 'var(--font-script)', lineHeight: 1, margin: '0 0 .5rem',
            fontSize: `calc(2rem * var(--scale-heading, 1))`,
            color: 'var(--color-primary)',
          }}>
            Ngọc Sơn &amp; Ái Nhãn
          </p>
          <p style={{
            fontFamily: 'var(--font-heading)', letterSpacing: '.06em', margin: '0 0 .75rem',
            fontSize: `calc(1.4rem * var(--scale-heading, 1))`,
            color: 'var(--color-primary)',
          }}>
            05 · 07 · 2026
          </p>
          <div style={{ width: 60, height: 1, background: 'var(--color-accent)', margin: '.75rem auto', opacity: .7 }} />
          <p style={{
            fontFamily: 'var(--font-body)', letterSpacing: '.25em', textTransform: 'uppercase', margin: '0 0 .35rem',
            fontSize: `calc(.7rem * var(--scale-body, 1))`,
            color: 'var(--color-accent)',
          }}>
            Wedding Invitation
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', letterSpacing: '.12em', textTransform: 'uppercase',
            fontSize: `calc(.75rem * var(--scale-body, 1))`,
            color: '#5C3535',
          }}>
            Trân trọng kính mời
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 font-body text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button" onClick={() => save(theme)} disabled={saving}
          className="flex-1 bg-burg text-cream font-body font-medium py-3 rounded-xl hover:bg-burg-2 transition-colors disabled:opacity-60"
        >
          {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu!' : 'Lưu giao diện'}
        </button>
        <button
          type="button" onClick={handleReset} disabled={saving}
          className="px-4 py-3 border border-[#E4D8C6] text-soft font-body text-sm rounded-xl hover:border-burg hover:text-burg transition-colors disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
