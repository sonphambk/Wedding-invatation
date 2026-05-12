'use client'
import { useEffect, useRef, useState } from 'react'
import { PhotoEntry } from '@/lib/types'
import Image from 'next/image'

interface Props { photos: PhotoEntry[] }

export default function PhotoAlbum({ photos }: Props) {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order)
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const touchingRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    function onScroll() {
      if (!track) return
      setCurrent(Math.round(track.scrollLeft / track.clientWidth))
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    track.addEventListener('touchstart', () => { touchingRef.current = true }, { passive: true })
    track.addEventListener('touchend',   () => { touchingRef.current = false }, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track || sorted.length <= 1) return
    const id = setInterval(() => {
      if (touchingRef.current) return
      const next = (current + 1) % sorted.length
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
    }, 4000)
    return () => clearInterval(id)
  }, [current, sorted.length])

  return (
    <>
      <style>{`
        .album { background: #231010; overflow: hidden; }
        .album-header {
          padding: 1.5rem 1.5rem .75rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .album-title { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; color: #FAF8F3; }
        .album-counter { font-family: 'Montserrat', sans-serif; font-size: .7rem; color: rgba(255,255,255,.4); }
        .album-track {
          display: flex; overflow-x: scroll;
          scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .album-track::-webkit-scrollbar { display: none; }
        .album-slide { flex: 0 0 100%; scroll-snap-align: start; position: relative; height: 280px; }
        .album-dots { display: flex; gap: .4rem; justify-content: center; padding: 1rem; }
        .album-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.25); transition: background .2s; }
        .album-dot.active { background: #C9A96E; }
      `}</style>

      <section className="album">
        <div className="album-header">
          <h2 className="album-title">Album ảnh</h2>
          <span className="album-counter">{current + 1} / {sorted.length}</span>
        </div>

        <div className="album-track" ref={trackRef}>
          {sorted.map((photo, i) => (
            <div key={photo.url} className="album-slide">
              <Image
                src={photo.url}
                alt={`Ảnh cưới ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="430px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div className="album-dots">
          {sorted.map((_, i) => (
            <div key={i} className={`album-dot${i === current ? ' active' : ''}`} />
          ))}
        </div>
      </section>
    </>
  )
}
