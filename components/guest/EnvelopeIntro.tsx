'use client'
import { useEffect, useRef } from 'react'

interface Props {
  brideName: string
  groomName: string
}

export default function EnvelopeIntro({ brideName, groomName }: Props) {
  const envelopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const envelope = envelopeRef.current
    if (!envelope) return

    function open() {
      if (!envelope) return
      envelope.classList.add('opening')
      setTimeout(() => {
        envelope.style.display = 'none'
        const main = document.getElementById('main-content')
        if (main) main.style.display = 'block'
        window.dispatchEvent(new Event('envelope-opened'))
      }, 800)
    }

    envelope.addEventListener('click', open)
    return () => envelope.removeEventListener('click', open)
  }, [])

  return (
    <>
      <style>{`
        #envelope {
          position: fixed; inset: 0; z-index: 200;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #FAF8F3; cursor: pointer;
        }
        #envelope.opening { animation: envelopeExit .8s ease forwards; }
        @keyframes envelopeExit {
          0%   { opacity: 1; transform: translateY(0) }
          60%  { opacity: 0; transform: translateY(-60px) }
          100% { opacity: 0; transform: translateY(-100%) }
        }
        .env-seal {
          width: 120px; height: 120px;
          border: 2px solid #C9A96E; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2rem;
          animation: sealPulse 2s ease-in-out infinite;
        }
        @keyframes sealPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(201,169,110,.15) }
          50%       { box-shadow: 0 0 0 16px rgba(201,169,110,.05) }
        }
        .env-xi { font-size: 52px; color: #7C1B2B; line-height: 1; }
        .env-names {
          font-family: 'Great Vibes', cursive; font-size: 2rem;
          color: #231010; margin-bottom: 2rem; text-align: center;
        }
        .env-tap {
          font-family: 'Montserrat', sans-serif; font-size: .75rem;
          letter-spacing: .15em; color: #7A5555; text-transform: uppercase;
          animation: tapBlink 1.5s ease-in-out infinite;
        }
        @keyframes tapBlink { 0%,100%{opacity:.4} 50%{opacity:1} }
        .petal {
          position: absolute; width: 8px; height: 12px;
          border-radius: 50% 0 50% 0; background: #D8BC8A;
          opacity: 0; animation: petalFall linear infinite; pointer-events: none;
        }
        @keyframes petalFall {
          0%   { opacity: 0; transform: translateY(-20px) rotate(0deg) }
          10%  { opacity: .6 }
          90%  { opacity: .3 }
          100% { opacity: 0; transform: translateY(100vh) rotate(360deg) }
        }
      `}</style>

      <div id="envelope" ref={envelopeRef}>
        {[
          { left: '15%', delay: '0s',   dur: '6s'   },
          { left: '30%', delay: '1.5s', dur: '8s'   },
          { left: '50%', delay: '0.8s', dur: '7s'   },
          { left: '65%', delay: '2.2s', dur: '9s'   },
          { left: '80%', delay: '0.3s', dur: '6.5s' },
          { left: '40%', delay: '3.1s', dur: '7.5s' },
        ].map((p, i) => (
          <span key={i} className="petal"
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }} />
        ))}

        <div className="env-seal">
          <span className="env-xi">囍</span>
        </div>
        <p className="env-names">{groomName} &amp; {brideName}</p>
        <p className="env-tap">Chạm để mở thiệp</p>
      </div>
    </>
  )
}
