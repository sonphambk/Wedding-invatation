'use client'
import { useState } from 'react'
import ConfigForm from './ConfigForm'
import PhotoManager from './PhotoManager'
import WishesManager from './WishesManager'
import ThemeEditor from './ThemeEditor'

type Tab = 'config' | 'photos' | 'wishes' | 'theme'

const TABS: { id: Tab; label: string }[] = [
  { id: 'config', label: 'Thông tin' },
  { id: 'photos', label: 'Ảnh' },
  { id: 'wishes', label: 'Lời chúc' },
  { id: 'theme', label: '🎨 Giao diện' },
]

export default function AdminShell() {
  const [tab, setTab] = useState<Tab>('config')

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-cream-2">
      <header className="bg-burg text-cream px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-display text-lg leading-none">Quản lý thiệp cưới</p>
          <p className="font-body text-xs opacity-60 mt-0.5">Ngọc Sơn &amp; Ái Nhãn</p>
        </div>
        <button
          onClick={handleLogout}
          className="font-body text-xs opacity-70 hover:opacity-100 border border-cream/30 px-3 py-1.5 rounded-lg transition-opacity"
        >
          Đăng xuất
        </button>
      </header>

      <nav className="bg-white border-b border-[#E4D8C6] sticky top-[52px] z-10">
        <div className="flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 font-body text-sm font-medium transition-colors border-b-2 ${
                tab === t.id ? 'border-burg text-burg' : 'border-transparent text-soft hover:text-dark'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-xl mx-auto p-4">
        {tab === 'config' && <ConfigForm />}
        {tab === 'photos' && <PhotoManager />}
        {tab === 'wishes' && <WishesManager />}
        {tab === 'theme' && <ThemeEditor />}
      </main>
    </div>
  )
}
