'use client'
import { useEffect, useState } from 'react'
import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null; guestName?: string }

function diff(target: number) {
  const now = Date.now()
  const ms = Math.max(0, target - now)
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

export default function InvitationMessage({ config, guestName }: Props) {
  const target = config?.wedding_date
    ? new Date(config.wedding_date).getTime()
    : new Date('2026-07-05T11:00:00+07:00').getTime()
  const [t, setT] = useState(() => diff(target))

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const groom = config?.groom_name ?? 'Ngọc Sơn'
  const bride = config?.bride_name ?? 'Ái Nhãn'

  return (
    <>
      <style>{`
        .im-sec {
          background: #FAF6EE;
          padding: clamp(3rem, 7vw, 5rem) clamp(1.25rem, 4vw, 2rem);
          position: relative;
          overflow: hidden;
        }
        .im-inner {
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }
        @media (max-width: 720px) {
          .im-inner { grid-template-columns: 1fr; gap: 2.5rem; text-align: center; }
        }
        .im-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .68rem;
          letter-spacing: .38em;
          text-transform: uppercase;
          color: #C9A96E;
          margin-bottom: .75rem;
        }
        .im-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(2.5rem, 7vw, 4rem);
          color: #7C1B2B;
          line-height: 1;
          margin: 0 0 1.5rem;
        }
        .im-intro {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(.95rem, 2vw, 1.1rem);
          color: #5C3535;
          line-height: 1.7;
          margin: 0 0 1.25rem;
        }
        .im-guest {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(1.6rem, 4.5vw, 2.4rem);
          color: #7C1B2B;
          line-height: 1;
          margin: 0 0 1.5rem;
        }
        .im-names {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 600;
          font-size: clamp(1.4rem, 4vw, 2rem);
          letter-spacing: .04em;
          color: #231010;
          text-transform: uppercase;
          line-height: 1.3;
        }
        .im-amp {
          font-family: 'Great Vibes', cursive;
          font-weight: 400;
          color: #C9A96E;
          font-size: 1.4em;
          text-transform: none;
          margin: 0 .35em;
          vertical-align: -.05em;
        }
        .im-count-wrap {
          text-align: center;
        }
        .im-count-label {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(.95rem, 2vw, 1.1rem);
          color: #5C3535;
          margin-bottom: 1.25rem;
        }
        .im-count {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(.5rem, 1.5vw, 1rem);
        }
        .im-cell {
          background: #FAF8F3;
          border: 1px solid #E4D8C6;
          padding: clamp(.85rem, 2.2vw, 1.25rem) .5rem;
          position: relative;
        }
        .im-cell::before {
          content: '';
          position: absolute; inset: 4px;
          border: 1px solid #C9A96E; opacity: .35;
          pointer-events: none;
        }
        .im-cell-num {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(1.5rem, 4.5vw, 2.4rem);
          color: #7C1B2B;
          line-height: 1;
        }
        .im-cell-lbl {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .58rem;
          letter-spacing: .25em;
          text-transform: uppercase;
          color: #7A5555;
          margin-top: .4rem;
        }
      `}</style>

      <section className="im-sec" aria-label="Thiệp mời">
        <div className="im-inner">
          <div>
            <span className="im-eyebrow">Wedding Invitation</span>
            <h2 className="im-title">Thiệp mời</h2>
            <p className="im-intro">Trân trọng kính mời:</p>
            {guestName && <p className="im-guest">{guestName}</p>}
            <p className="im-intro">
              Đến dự buổi lễ chung vui cùng gia đình chúng tôi
            </p>
            <p className="im-names">
              {groom}<span className="im-amp">&amp;</span>{bride}
            </p>
          </div>

          <div className="im-count-wrap">
            <span className="im-count-label">Hôn lễ sẽ diễn ra sau</span>
            <div className="im-count">
              <div className="im-cell">
                <span className="im-cell-num">{String(t.days).padStart(2, '0')}</span>
                <span className="im-cell-lbl">Ngày</span>
              </div>
              <div className="im-cell">
                <span className="im-cell-num">{String(t.hours).padStart(2, '0')}</span>
                <span className="im-cell-lbl">Giờ</span>
              </div>
              <div className="im-cell">
                <span className="im-cell-num">{String(t.minutes).padStart(2, '0')}</span>
                <span className="im-cell-lbl">Phút</span>
              </div>
              <div className="im-cell">
                <span className="im-cell-num">{String(t.seconds).padStart(2, '0')}</span>
                <span className="im-cell-lbl">Giây</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
