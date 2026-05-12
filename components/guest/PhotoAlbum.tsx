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
      const slides = track.querySelectorAll<HTMLElement>('.album-slide')
      if (!slides.length) return
      const center = track.scrollLeft + track.clientWidth / 2
      let best = 0; let bestDist = Infinity
      slides.forEach((s, i) => {
        const sc = s.offsetLeft + s.offsetWidth / 2
        const dist = Math.abs(sc - center)
        if (dist < bestDist) { bestDist = dist; best = i }
      })
      setCurrent(best)
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
      const slide = track.querySelectorAll<HTMLElement>('.album-slide')[next]
      if (!slide) return
      const left = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2
      track.scrollTo({ left, behavior: 'smooth' })
    }, 4500)
    return () => clearInterval(id)
  }, [current, sorted.length])

  return (
    <>
      <style>{`
        .album {
          background: #F0E9DC;
          padding: clamp(3rem, 7vw, 5rem) 0 clamp(2.5rem, 5vw, 4rem);
        }
        .album-eyebrow {
          display: block; text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-size: .68rem; letter-spacing: .38em;
          text-transform: uppercase; color: #C9A96E;
          margin-bottom: .75rem;
        }
        .album-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 4.5vw, 2.8rem);
          color: #7C1B2B; text-align: center;
          font-weight: 400; letter-spacing: .02em;
          margin: 0 0 clamp(2rem, 4vw, 3rem);
        }
        .album-track {
          display: flex;
          gap: 1rem;
          overflow-x: scroll;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 0 clamp(1.25rem, 4vw, 3rem) 1.5rem;
        }
        .album-track::-webkit-scrollbar { display: none; }
        .album-slide {
          flex: 0 0 min(78%, 380px);
          scroll-snap-align: center;
          position: relative;
          aspect-ratio: 3 / 4;
          background: #E4D8C6;
          overflow: hidden;
          box-shadow: 0 14px 30px -18px rgba(124,27,43,.35);
        }
        .album-slide::before {
          content: ''; position: absolute; inset: 10px;
          border: 1px solid rgba(250,248,243,.6);
          z-index: 2; pointer-events: none;
        }
        .album-slide img {
          transition: transform .8s ease, filter .8s ease;
          filter: saturate(.9) contrast(1.02);
        }
        .album-slide:hover img { transform: scale(1.04); filter: saturate(1.05); }
        .album-caption {
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-size: .9rem;
          color: #7A5555;
          margin: .5rem 0 0;
        }
        .album-dots {
          display: flex; gap: .4rem;
          justify-content: center; padding: .5rem 0 0;
        }
        .album-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(124,27,43,.2);
          transition: background .25s, transform .25s;
        }
        .album-dot.active {
          background: #7C1B2B;
          transform: scale(1.4);
        }
        @media (min-width: 768px) {
          .album-slide { flex: 0 0 min(36%, 360px); }
        }
      `}</style>

      <section className="album">
        <span className="album-eyebrow">Khoảnh khắc</span>
        <h2 className="album-title">Album ảnh cưới</h2>

        <div className="album-track" ref={trackRef}>
          {sorted.map((photo, i) => (
            <div key={photo.url} className="album-slide">
              <Image
                src={photo.url}
                alt={`Ảnh cưới ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(min-width:768px) 360px, 78vw"
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
