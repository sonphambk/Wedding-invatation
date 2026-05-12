'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  brideName: string
  groomName: string
  guestName?: string
}

export default function EnvelopeIntro({ brideName, groomName, guestName }: Props) {
  const [opened, setOpened] = useState(false)
  const [done, setDone] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function open() {
    if (opened) return
    setOpened(true)
    setTimeout(() => {
      const main = document.getElementById('main-content')
      if (main) main.style.display = 'block'
      setDone(true)
      setTimeout(() => main?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }, 1300)
  }

  useEffect(() => {
    if (!done) return
    const el = containerRef.current
    if (el) el.style.display = 'none'
  }, [done])

  return (
    <>
      <style>{`
        .env2 {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          background: linear-gradient(180deg, #FAF6EE 0%, #F0E9DC 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 3vw, 2rem);
          overflow: hidden;
        }
        .env2::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 15% 20%, rgba(124,27,43,.05), transparent 35%),
            radial-gradient(circle at 85% 80%, rgba(201,169,110,.06), transparent 40%);
          pointer-events: none;
        }

        .env2-card {
          position: relative;
          width: min(92vw, 360px);
          aspect-ratio: 360 / 540;
          background: #FAF8F3;
          box-shadow:
            0 30px 60px -25px rgba(124,27,43,.35),
            0 8px 20px -8px rgba(0,0,0,.15);
          cursor: pointer;
          transform: ${opened ? 'translateY(-3%) scale(1.02)' : 'translateY(0) scale(1)'};
          opacity: ${opened ? 0 : 1};
          transition:
            transform 1.1s cubic-bezier(.22,.9,.32,1),
            opacity .9s ease .25s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(1.5rem, 5vw, 2.4rem);
          text-align: center;
        }
        .env2-card::before {
          content: '';
          position: absolute; inset: 10px;
          border: 1px solid rgba(201,169,110,.35);
          pointer-events: none;
        }

        .env2-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: .65rem;
          letter-spacing: .42em;
          text-transform: uppercase;
          color: #C9A96E;
          margin-bottom: clamp(1.2rem, 4vw, 1.8rem);
        }

        .env2-disc {
          width: clamp(110px, 28vw, 150px);
          height: clamp(110px, 28vw, 150px);
          margin-bottom: clamp(1.4rem, 4vw, 2rem);
        }
        .env2-disc svg { width: 100%; height: 100%; display: block; }

        .env2-names {
          font-family: 'Great Vibes', cursive;
          color: #7C1B2B;
          font-size: clamp(1.8rem, 6vw, 2.4rem);
          line-height: 1.1;
          margin: 0;
        }
        .env2-amp {
          display: block;
          font-size: .55em;
          color: #C9A96E;
          margin: -.05em 0;
        }

        .env2-divider {
          width: 50px; height: 1px;
          background: #C9A96E;
          opacity: .55;
          margin: clamp(1rem, 3vw, 1.4rem) auto;
        }

        .env2-date {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: #7C1B2B;
          font-size: clamp(1.4rem, 4.2vw, 1.85rem);
          letter-spacing: .04em;
          margin: 0;
          line-height: 1;
        }
        .env2-save {
          display: block;
          margin-top: .5rem;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: #5C3535;
          font-size: clamp(.78rem, 1.8vw, .92rem);
          letter-spacing: .04em;
        }

        .env2-guest {
          margin-top: clamp(1.2rem, 4vw, 1.8rem);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: #231010;
          font-size: clamp(.78rem, 1.8vw, .92rem);
          line-height: 1.5;
        }
        .env2-guest strong {
          display: block;
          margin-top: .3rem;
          font-family: 'Great Vibes', cursive;
          font-style: normal;
          font-weight: 400;
          color: #7C1B2B;
          font-size: clamp(1.4rem, 3.6vw, 1.7rem);
          line-height: 1;
        }

        .env2-tap {
          margin-top: clamp(1.5rem, 5vh, 2.2rem);
          font-family: 'Great Vibes', cursive;
          color: #7C1B2B;
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          opacity: ${opened ? 0 : 1};
          transition: opacity .4s;
          animation: ${opened ? 'none' : 'env2Bob 2.2s ease-in-out infinite'};
        }
        @keyframes env2Bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="env2" ref={containerRef} role="button" tabIndex={0}
           onClick={open}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="env2-card">
            <span className="env2-eyebrow">Wedding Invitation</span>

            <div className="env2-disc" aria-hidden="true">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="47" fill="#7C1B2B" />
                <circle cx="50" cy="50" r="43" fill="none" stroke="#C9A96E" strokeWidth=".6" opacity=".5" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
                      fontSize="62" fontWeight="700"
                      fontFamily="'Noto Serif SC','Songti SC',serif"
                      fill="#FAF6EE">囍</text>
              </svg>
            </div>

            <h1 className="env2-names">
              {groomName}
              <span className="env2-amp">&amp;</span>
              {brideName}
            </h1>

            <div className="env2-divider" />

            <p className="env2-date">05.07.2026</p>
            <span className="env2-save">Save the Date</span>

            {guestName && (
              <p className="env2-guest">
                Trân trọng kính mời
                <strong>{guestName}</strong>
              </p>
            )}
          </div>

          <span className="env2-tap">Chạm để mở thiệp ✦</span>
        </div>
      </div>
    </>
  )
}
