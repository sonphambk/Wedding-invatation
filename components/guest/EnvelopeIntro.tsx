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
    }, 1600)
  }

  useEffect(() => {
    if (!done) return
    const el = containerRef.current
    if (el) el.style.display = 'none'
  }, [done])

  return (
    <>
      <style>{`
        .env3 {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          background:
            radial-gradient(ellipse at center, #FAF6EE 0%, #E8DEC9 75%, #D8C9A8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1rem, 4vw, 2rem);
          overflow: hidden;
          font-family: 'Cormorant Garamond', 'Tinos', serif;
        }
        .env3::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 12% 18%, rgba(124,27,43,.06), transparent 38%),
            radial-gradient(circle at 88% 82%, rgba(201,169,110,.09), transparent 42%);
          pointer-events: none;
        }
        /* paper grain */
        .env3::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.486 0 0 0 0 0.106 0 0 0 0 0.168 0 0 0 .08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          mix-blend-mode: multiply;
          opacity: .35;
          pointer-events: none;
        }

        /* CARD STAGE — landscape (horizontal) */
        .env3-stage {
          position: relative;
          width: min(94vw, 880px);
          aspect-ratio: 16 / 10;
          perspective: 1800px;
          cursor: pointer;
        }
        @media (max-width: 560px) {
          /* On narrow phones, switch to portrait so doors are still readable */
          .env3-stage { aspect-ratio: 4 / 5; max-width: 92vw; }
        }

        /* INNER (background under the doors) */
        .env3-inner {
          position: absolute; inset: 0;
          background: #FAF8F3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: clamp(1rem, 3.5vw, 2rem);
          text-align: center;
          box-shadow: inset 0 0 0 1px rgba(201,169,110,.45);
        }
        .env3-inner::before {
          content: '';
          position: absolute; inset: 12px;
          border: 1px solid rgba(201,169,110,.55);
          pointer-events: none;
        }
        .env3-inner-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(.55rem, 1.4vw, .68rem);
          letter-spacing: .42em;
          text-transform: uppercase;
          color: #C9A96E;
          margin-bottom: clamp(.8rem, 2vw, 1.2rem);
        }
        .env3-inner-names {
          font-family: 'Great Vibes', cursive;
          color: #7C1B2B;
          font-size: clamp(2rem, 7vw, 3.4rem);
          line-height: 1;
          margin: 0;
        }
        .env3-inner-amp {
          display: inline-block;
          margin: 0 .3em;
          color: #C9A96E;
          font-size: .8em;
        }
        .env3-inner-divider {
          width: clamp(60px, 12vw, 90px);
          height: 1px;
          background: #C9A96E;
          opacity: .6;
          margin: clamp(.8rem, 2.4vw, 1.4rem) auto;
        }
        .env3-inner-date {
          font-family: 'Cormorant Garamond', serif;
          color: #7C1B2B;
          font-size: clamp(1rem, 2.8vw, 1.4rem);
          letter-spacing: .04em;
          margin: 0;
        }

        /* DOORS — burgundy panels that meet in the middle */
        .env3-door {
          position: absolute;
          top: 0; bottom: 0;
          width: 50.05%;  /* tiny overlap to hide seam pixel */
          background:
            linear-gradient(180deg, #931f33 0%, #7C1B2B 50%, #631323 100%);
          box-shadow:
            0 30px 60px -25px rgba(99,19,35,.55),
            0 10px 25px -10px rgba(0,0,0,.25);
          transition:
            transform 1.6s cubic-bezier(.65,.05,.2,1),
            opacity 1s ease .4s;
          will-change: transform;
          transform-origin: var(--origin);
          backface-visibility: hidden;
        }
        .env3-door::before {
          content: '';
          position: absolute;
          inset: 14px;
          border: 1px solid rgba(255, 218, 168, .35);
          pointer-events: none;
        }
        /* subtle vertical stripe down each door for paper-fold elegance */
        .env3-door::after {
          content: '';
          position: absolute;
          top: 14px; bottom: 14px;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,218,168,.18), transparent);
          pointer-events: none;
        }
        .env3-door.left {
          left: 0;
          --origin: left center;
          transform: ${opened ? 'rotateY(-105deg)' : 'rotateY(0)'};
        }
        .env3-door.left::after { right: 32px; }
        .env3-door.right {
          right: 0;
          --origin: right center;
          transform: ${opened ? 'rotateY(105deg)' : 'rotateY(0)'};
        }
        .env3-door.right::after { left: 32px; }

        @media (max-width: 560px) {
          /* Portrait phone: doors split top/bottom instead, looks cleaner */
          .env3-door {
            top: 0; left: 0;
            width: 100%;
            height: 50.05%;
            background: linear-gradient(180deg, #931f33 0%, #7C1B2B 50%, #631323 100%);
          }
          .env3-door.left { /* top */
            --origin: center top;
            transform: ${opened ? 'rotateX(105deg)' : 'rotateX(0)'};
          }
          .env3-door.right { /* bottom */
            top: auto; bottom: 0;
            --origin: center bottom;
            transform: ${opened ? 'rotateX(-105deg)' : 'rotateX(0)'};
          }
        }

        /* Content printed on the doors (visible before opening) */
        .env3-face {
          position: absolute;
          inset: 0;
          padding: clamp(1.4rem, 4vw, 2.5rem);
          color: #FAF6EE;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .env3-save {
          /* Vertical "Save the Date" up the left door, like thevow */
          position: absolute;
          top: clamp(1.5rem, 4vw, 2.4rem);
          left: clamp(1.5rem, 4vw, 2.4rem);
          font-family: 'Great Vibes', cursive;
          color: rgba(255,255,255,.92);
          font-size: clamp(1.6rem, 5.5vw, 2.6rem);
          line-height: 1;
          letter-spacing: .01em;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0,0,0,.25);
        }
        .env3-save .first {
          display: inline-block;
          font-size: 1.6em;
          line-height: .8;
          margin-right: .05em;
          vertical-align: -.15em;
        }
        @media (max-width: 560px) {
          .env3-save {
            font-size: clamp(1.4rem, 8vw, 2rem);
          }
        }

        .env3-corner-brand {
          position: absolute;
          top: clamp(1.4rem, 4vw, 2.3rem);
          right: clamp(1.4rem, 4vw, 2.3rem);
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: rgba(255,255,255,.55);
          font-size: clamp(.55rem, 1.3vw, .7rem);
          letter-spacing: .12em;
          text-align: right;
          line-height: 1.4;
        }

        .env3-couple {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 86%;
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          color: rgba(255,255,255,.95);
          padding-top: clamp(2rem, 6vw, 3.5rem); /* leave room for seal */
        }
        .env3-couple-amp {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          color: rgba(255,218,168,.85);
          font-size: clamp(1.4rem, 4vw, 2.2rem);
          line-height: 1;
          margin: .15em 0;
          transform: rotate(-4deg);
        }
        .env3-couple-name {
          display: block;
          font-family: 'Great Vibes', cursive;
          font-weight: 400;
          font-size: clamp(1.6rem, 4.8vw, 2.6rem);
          line-height: 1.1;
          letter-spacing: .01em;
        }

        .env3-invite {
          position: absolute;
          left: clamp(1.4rem, 4vw, 2.3rem);
          right: clamp(1.4rem, 4vw, 2.3rem);
          bottom: clamp(1.4rem, 4vw, 2.3rem);
          text-align: left;
          color: rgba(255,255,255,.88);
          font-family: 'Cormorant Garamond', serif;
        }
        .env3-invite-line {
          display: block;
          font-size: clamp(.7rem, 1.6vw, .85rem);
          letter-spacing: .04em;
          line-height: 1.4;
        }
        .env3-invite-guest {
          display: block;
          margin-top: .25rem;
          font-family: 'Great Vibes', cursive;
          font-size: clamp(1.3rem, 3.5vw, 1.9rem);
          color: #FAF6EE;
          line-height: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,.2);
        }

        /* SEAL — gold disc joining the two doors */
        .env3-seal {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) ${opened ? 'scale(.4)' : 'scale(1)'};
          width: clamp(78px, 14vw, 110px);
          height: clamp(78px, 14vw, 110px);
          z-index: 4;
          opacity: ${opened ? 0 : 1};
          transition: transform .9s cubic-bezier(.55,.05,.2,1), opacity .7s ease;
          pointer-events: none;
        }
        .env3-seal svg {
          width: 100%; height: 100%;
          filter:
            drop-shadow(0 6px 14px rgba(0,0,0,.35))
            drop-shadow(0 2px 4px rgba(99,19,35,.4));
        }

        .env3-tap {
          position: absolute;
          bottom: clamp(1rem, 4vh, 2rem);
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Great Vibes', cursive;
          color: #7C1B2B;
          font-size: clamp(1.2rem, 3.2vw, 1.6rem);
          opacity: ${opened ? 0 : 1};
          transition: opacity .4s;
          animation: ${opened ? 'none' : 'env3Bob 2.2s ease-in-out infinite'};
          white-space: nowrap;
          pointer-events: none;
          z-index: 5;
        }
        @keyframes env3Bob {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -7px); }
        }
      `}</style>

      <div className="env3" ref={containerRef} role="button" tabIndex={0}
           onClick={open}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}>

        <div className="env3-stage" aria-label="Thiệp cưới">
          {/* INNER (revealed after doors open) */}
          <div className="env3-inner">
            <span className="env3-inner-eyebrow">Wedding Invitation</span>
            <h1 className="env3-inner-names">
              {groomName}<span className="env3-inner-amp">&amp;</span>{brideName}
            </h1>
            <div className="env3-inner-divider" />
            <p className="env3-inner-date">05.07.2026 · Chủ Nhật</p>
          </div>

          {/* LEFT DOOR (top on mobile) */}
          <div className="env3-door left">
            <div className="env3-face">
              <div className="env3-save">
                <span className="first">S</span>ave the Date
              </div>
              <div className="env3-couple" aria-hidden="true">
                <span className="env3-couple-name">{groomName}</span>
              </div>
              <div className="env3-invite">
                <span className="env3-invite-line">Trân trọng kính mời:</span>
                {guestName && <span className="env3-invite-guest">{guestName}</span>}
              </div>
            </div>
          </div>

          {/* RIGHT DOOR (bottom on mobile) */}
          <div className="env3-door right">
            <div className="env3-face">
              <div className="env3-corner-brand">
                Sơn &amp; Nhãn<br />05 · 07 · 2026
              </div>
              <div className="env3-couple" aria-hidden="true">
                <span className="env3-couple-amp">&amp;</span>
                <span className="env3-couple-name">{brideName}</span>
              </div>
            </div>
          </div>

          {/* GOLD SEAL with 囍 */}
          <div className="env3-seal" aria-hidden="true">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="goldSeal" cx="35%" cy="30%">
                  <stop offset="0%" stopColor="#f5d98a" />
                  <stop offset="45%" stopColor="#c9a04a" />
                  <stop offset="100%" stopColor="#8a6a2a" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="47" fill="url(#goldSeal)" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#FAF6EE" strokeOpacity=".5" strokeWidth=".8" />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
                    fontSize="48" fontWeight="700"
                    fontFamily="'Noto Serif SC','Songti SC',serif"
                    fill="#5a1120">囍</text>
            </svg>
          </div>
        </div>

        <span className="env3-tap">Chạm để mở thiệp ✦</span>
      </div>
    </>
  )
}
