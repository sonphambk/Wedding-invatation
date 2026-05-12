'use client'
import { useEffect, useState } from 'react'

interface Props { weddingDate: string }

function pad(n: number) { return String(Math.max(0, Math.floor(n))).padStart(2, '0') }

export default function CountdownTimer({ weddingDate }: Props) {
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    const target = new Date(weddingDate).getTime()
    function tick() { setDiff(Math.max(0, target - Date.now())) }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [weddingDate])

  const days  = Math.floor(diff / 864e5)
  const hours = Math.floor((diff % 864e5) / 36e5)
  const mins  = Math.floor((diff % 36e5) / 6e4)
  const secs  = Math.floor((diff % 6e4) / 1e3)

  return (
    <>
      <style>{`
        .countdown { background: #7C1B2B; padding: 2.5rem 1.5rem; text-align: center; }
        .countdown-label {
          font-family: 'Montserrat', sans-serif; font-size: .65rem;
          letter-spacing: .2em; color: rgba(255,255,255,.6);
          text-transform: uppercase; margin-bottom: 1rem;
        }
        .countdown-grid { display: flex; gap: 1rem; justify-content: center; }
        .cd-block { flex: 1; max-width: 72px; }
        .cd-num {
          font-family: 'Cormorant Garamond', serif; font-size: 2.5rem;
          color: #FAF8F3; font-weight: 300; line-height: 1;
        }
        .cd-unit {
          font-family: 'Montserrat', sans-serif; font-size: .6rem;
          color: rgba(255,255,255,.5); text-transform: uppercase;
          letter-spacing: .1em; margin-top: .25rem;
        }
      `}</style>

      <section className="countdown">
        <p className="countdown-label">Đếm ngược đến ngày cưới</p>
        <div className="countdown-grid">
          {[
            { n: pad(days),  u: 'Ngày' },
            { n: pad(hours), u: 'Giờ'  },
            { n: pad(mins),  u: 'Phút' },
            { n: pad(secs),  u: 'Giây' },
          ].map(({ n, u }) => (
            <div key={u} className="cd-block">
              <div className="cd-num">{n}</div>
              <div className="cd-unit">{u}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
