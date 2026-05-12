'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wish } from '@/lib/types'

type Filter = 'pending' | 'approved' | 'all'

export default function WishesManager() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')

  const loadWishes = useCallback(async () => {
    const res = await fetch('/api/admin/wishes')
    if (res.ok) setWishes(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadWishes() }, [loadWishes])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('wishes-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, () => loadWishes())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadWishes])

  async function toggleApprove(id: string, currentApproved: boolean) {
    await fetch(`/api/wishes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !currentApproved }),
    })
    setWishes((prev) => prev.map((w) => w.id === id ? { ...w, approved: !currentApproved } : w))
  }

  async function deleteWish(id: string) {
    if (!confirm('Xoá lời chúc này?')) return
    await fetch(`/api/wishes/${id}`, { method: 'DELETE' })
    setWishes((prev) => prev.filter((w) => w.id !== id))
  }

  const filtered = wishes.filter((w) =>
    filter === 'pending' ? !w.approved : filter === 'approved' ? w.approved : true
  )

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <div className="py-4">
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['pending', 'approved', 'all'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-colors ${
              filter === f ? 'bg-burg text-cream' : 'bg-white text-mid hover:text-dark border border-[#E4D8C6]'
            }`}>
            {f === 'pending'
              ? `Chờ duyệt (${wishes.filter((w) => !w.approved).length})`
              : f === 'approved' ? 'Đã duyệt' : 'Tất cả'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-body text-sm text-soft text-center py-8 italic">Không có lời chúc</p>
      ) : (
        filtered.map((w) => (
          <div key={w.id} className="bg-white rounded-xl p-4 mb-3 border border-[#E4D8C6]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-display text-dark font-medium">{w.guest_name}</span>
              <span className="font-body text-xs text-soft flex-shrink-0">
                {new Date(w.created_at).toLocaleString('vi-VN')}
              </span>
            </div>
            <p className="font-body text-sm text-mid mb-3 leading-relaxed">{w.message}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => toggleApprove(w.id, w.approved)}
                className={`px-3 py-1 rounded-lg font-body text-xs font-medium transition-colors ${
                  w.approved
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-burg text-cream hover:bg-burg-2'
                }`}>
                {w.approved ? '✓ Đã duyệt' : '✓ Duyệt'}
              </button>
              <button onClick={() => deleteWish(w.id)}
                className="px-3 py-1 rounded-lg font-body text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                🗑 Xoá
              </button>
              <span className="font-body text-xs text-soft ml-auto">❤️ {w.likes}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
