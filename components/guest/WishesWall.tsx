'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PublicWish } from '@/lib/types'
import WishForm from './WishForm'

export default function WishesWall() {
  const [wishes, setWishes] = useState<PublicWish[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/wishes').then((r) => r.json()).then(setWishes).catch(() => {})
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('liked_wishes')
      if (raw) setLikedIds(new Set(JSON.parse(raw)))
    } catch {}
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('wishes-wall')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, (payload) => {
        if (payload.eventType === 'INSERT' && (payload.new as PublicWish & { approved: boolean }).approved) {
          setWishes((prev) => [payload.new as PublicWish, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setWishes((prev) =>
            prev.map((w) => w.id === payload.new.id ? { ...w, ...payload.new } as PublicWish : w)
          )
        } else if (payload.eventType === 'DELETE') {
          setWishes((prev) => prev.filter((w) => w.id !== (payload.old as { id: string }).id))
        }
      })
      .subscribe()

    const pollId = setInterval(() => {
      fetch('/api/wishes').then((r) => r.json()).then(setWishes).catch(() => {})
    }, 30_000)

    return () => { supabase.removeChannel(channel); clearInterval(pollId) }
  }, [])

  async function like(id: string) {
    if (likedIds.has(id)) return
    const newLiked = new Set(likedIds).add(id)
    setLikedIds(newLiked)
    localStorage.setItem('liked_wishes', JSON.stringify([...newLiked]))
    setWishes((prev) => prev.map((w) => w.id === id ? { ...w, likes: w.likes + 1 } : w))
    await fetch(`/api/wishes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ like: true }),
    })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <>
      <style>{`
        .wishes { padding: 2.5rem 1.5rem; background: #F0E9DC; }
        .wishes-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: #231010; text-align: center; margin-bottom: 1.5rem; }
        .wish-card { background: #FAF8F3; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: .75rem; }
        .wish-header { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; margin-bottom: .5rem; }
        .wish-name { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 600; color: #231010; }
        .wish-date { font-family: 'Montserrat', sans-serif; font-size: .65rem; color: #7A5555; flex-shrink: 0; }
        .wish-msg  { font-family: 'Montserrat', sans-serif; font-size: .8rem; color: #5C3535; line-height: 1.6; }
        .wish-like { margin-top: .75rem; display: flex; align-items: center; gap: .4rem; }
        .like-btn  { background: none; border: none; cursor: pointer; padding: 0; font-size: .9rem; transition: transform .1s; }
        .like-btn:active { transform: scale(1.3); }
        .like-count { font-family: 'Montserrat', sans-serif; font-size: .7rem; color: #7A5555; }
        .wishes-divider { margin: 1.5rem 0; border: none; border-top: 1px solid #E4D8C6; }
        .wishes-empty { font-family: 'Montserrat', sans-serif; font-size: .8rem; color: #7A5555; text-align: center; padding: 1.5rem 0; font-style: italic; }
      `}</style>

      <section className="wishes">
        <h2 className="wishes-title">💌 Lời chúc</h2>
        <WishForm />
        <hr className="wishes-divider" />
        {wishes.length === 0 ? (
          <p className="wishes-empty">Chưa có lời chúc nào. Hãy là người đầu tiên!</p>
        ) : (
          wishes.map((w) => (
            <div key={w.id} className="wish-card">
              <div className="wish-header">
                <span className="wish-name">{w.guest_name}</span>
                <span className="wish-date">{formatDate(w.created_at)}</span>
              </div>
              <p className="wish-msg">{w.message}</p>
              <div className="wish-like">
                <button className="like-btn" onClick={() => like(w.id)} aria-label="Thích">
                  {likedIds.has(w.id) ? '❤️' : '🤍'}
                </button>
                {w.likes > 0 && <span className="like-count">{w.likes}</span>}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  )
}
