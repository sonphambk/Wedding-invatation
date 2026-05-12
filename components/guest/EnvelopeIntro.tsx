'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  brideName: string
  groomName: string
  guestName?: string
}

export default function EnvelopeIntro({ brideName, groomName, guestName }: Props) {
  const envelopeRef = useRef<HTMLDivElement>(null)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    const envelope = envelopeRef.current
    if (!envelope) return

    function open() {
      if (!envelope || opening) return
      setOpening(true)
      // Total animation: 1.8s. Reveal main content at 1.6s.
      setTimeout(() => {
        const main = document.getElementById('main-content')
        if (main) main.style.display = 'block'
        window.dispatchEvent(new Event('envelope-opened'))
      }, 1600)
      setTimeout(() => {
        envelope.style.display = 'none'
      }, 1900)
    }

    envelope.addEventListener('click', open)
    return () => envelope.removeEventListener('click', open)
  }, [opening])

  return (
    <>
      <style>{`
        #envelope {
          position: fixed; inset: 0; z-index: 200;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #FAF8F3; cursor: pointer;
          overflow: hidden;
          perspective: 1400px;
        }
        #envelope.opening { animation: bgFade 1.9s ease forwards; animation-delay: .9s; }
        @keyframes bgFade { to { opacity: 0; } }

        .env-stage {
          position: relative;
          width: min(86vw, 380px);
          aspect-ratio: 3 / 2;
          transform-style: preserve-3d;
        }
        .env-stage.opening { animation: stageLift 1.9s ease forwards; }
        @keyframes stageLift {
          0%   { transform: translateY(0) scale(1); }
          70%  { transform: translateY(-10px) scale(1.04); }
          100% { transform: translateY(-40vh) scale(.6); opacity: 0; }
        }

        .env-body {
          position: absolute; inset: 0;
          background: #F1E6D5;
          border: 1px solid #D9C8AC;
          box-shadow: 0 20px 50px -20px rgba(124,27,43,.25);
          overflow: hidden;
        }
        /* The pocket triangles (visual envelope sides) */
        .env-body::before, .env-body::after {
          content: ''; position: absolute; bottom: 0; width: 50%; height: 100%;
          background: #E8D9BE;
        }
        .env-body::before { left: 0; clip-path: polygon(0 0, 0 100%, 100% 100%); }
        .env-body::after  { right: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%); }

        .env-card {
          position: absolute; inset: 8% 6%;
          background: #FAF8F3;
          border: 1px solid #E4D8C6;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: .35rem; padding: 1rem;
          box-shadow: 0 8px 20px -8px rgba(0,0,0,.15);
          z-index: 1;
        }
        .env-card.slide-up {
          animation: cardSlide 1.4s ease forwards;
          animation-delay: .35s;
        }
        @keyframes cardSlide {
          0%   { transform: translateY(0); }
          60%  { transform: translateY(-58%); }
          100% { transform: translateY(-58%); }
        }
        .env-card-script {
          font-family: 'Allura', 'Great Vibes', cursive;
          font-size: clamp(1.5rem, 4.5vw, 2rem);
          color: #E0A890;
          line-height: 1;
        }
        .env-card-names {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(.85rem, 2.4vw, 1rem);
          letter-spacing: .18em;
          color: #7C1B2B;
          text-transform: uppercase;
          text-align: center;
        }
        .env-card-guest {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: .72rem;
          color: #5C3535;
          margin-top: .2rem;
        }

        /* Envelope flap - closed by default, rotates up on open */
        .env-flap {
          position: absolute; top: 0; left: 0; right: 0;
          height: 65%;
          background: #E8D9BE;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          transform-origin: top center;
          z-index: 2;
          box-shadow: 0 4px 8px rgba(0,0,0,.05);
        }
        .env-flap.opening {
          animation: flapOpen 1s ease forwards;
        }
        @keyframes flapOpen {
          0%   { transform: rotateX(0); }
          100% { transform: rotateX(-180deg); }
        }

        /* Wax seal */
        .env-seal {
          position: absolute; top: 58%; left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(48px, 12vw, 68px); height: clamp(48px, 12vw, 68px);
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #A12838, #7C1B2B 65%, #5A1120);
          box-shadow:
            inset 0 -4px 8px rgba(0,0,0,.3),
            inset 0 4px 6px rgba(255,255,255,.15),
            0 6px 14px rgba(124,27,43,.4);
          display: flex; align-items: center; justify-content: center;
          z-index: 3;
          animation: sealPulse 2.4s ease-in-out infinite;
        }
        .env-seal.opening {
          animation: sealCrack .5s ease forwards;
        }
        @keyframes sealPulse {
          0%, 100% { box-shadow: inset 0 -4px 8px rgba(0,0,0,.3), inset 0 4px 6px rgba(255,255,255,.15), 0 6px 14px rgba(124,27,43,.4), 0 0 0 6px rgba(124,27,43,.08); }
          50%      { box-shadow: inset 0 -4px 8px rgba(0,0,0,.3), inset 0 4px 6px rgba(255,255,255,.15), 0 6px 14px rgba(124,27,43,.4), 0 0 0 14px rgba(124,27,43,.02); }
        }
        @keyframes sealCrack {
          0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          40%  { transform: translate(-50%, -50%) scale(1.15) rotate(8deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(.6) rotate(-20deg); opacity: 0; }
        }
        .env-seal-xi {
          font-family: serif; font-size: 1.6rem;
          color: #F1E6D5; line-height: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,.3);
        }

        .env-prompt {
          position: absolute;
          bottom: clamp(2rem, 6vh, 4rem);
          left: 0; right: 0;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-size: .7rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: #7A5555;
          animation: promptBlink 1.6s ease-in-out infinite;
        }
        .env-prompt.opening { animation: fadeOut .4s ease forwards; }
        @keyframes promptBlink { 0%,100% { opacity: .4 } 50% { opacity: 1 } }
        @keyframes fadeOut { to { opacity: 0 } }

        .env-eyebrow {
          position: absolute;
          top: clamp(2rem, 6vh, 4rem);
          left: 0; right: 0;
          text-align: center;
          font-family: 'Great Vibes', cursive;
          font-size: clamp(1.4rem, 4vw, 2rem);
          color: #7C1B2B;
        }
        .env-eyebrow.opening { animation: fadeOut .4s ease forwards; }

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

        @media (prefers-reduced-motion: reduce) {
          .env-stage.opening, .env-flap.opening, .env-card.slide-up, .env-seal.opening {
            animation: none !important;
          }
          .env-stage.opening { opacity: 0; transition: opacity .3s; }
        }
      `}</style>

      <div id="envelope" ref={envelopeRef} className={opening ? 'opening' : ''}>
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

        <p className={`env-eyebrow ${opening ? 'opening' : ''}`}>Wedding Invitation</p>

        <div className={`env-stage ${opening ? 'opening' : ''}`}>
          <div className="env-body">
            <div className={`env-card ${opening ? 'slide-up' : ''}`}>
              <span className="env-card-script">Save the Date</span>
              <span className="env-card-names">{brideName} &amp; {groomName}</span>
              {guestName && (
                <span className="env-card-guest">Kính mời {guestName}</span>
              )}
            </div>
            <div className={`env-flap ${opening ? 'opening' : ''}`} />
            <div className={`env-seal ${opening ? 'opening' : ''}`}>
              <span className="env-seal-xi">囍</span>
            </div>
          </div>
        </div>

        <p className={`env-prompt ${opening ? 'opening' : ''}`}>
          Chạm để mở thiệp
        </p>
      </div>
    </>
  )
}
