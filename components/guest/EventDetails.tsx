import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

const VI_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export default function EventDetails({ config }: Props) {
  const d = config?.wedding_date ? new Date(config.wedding_date) : new Date('2026-07-05T11:00:00+07:00')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const weekday = VI_WEEKDAYS[d.getDay()]
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
  const heroPhoto = config?.photos?.[0]?.url ?? null

  return (
    <>
      <style>{`
        .ev-sec {
          background: #F5EFE3;
          padding: clamp(3rem, 7vw, 5rem) clamp(1.25rem, 4vw, 2rem);
        }
        .ev-inner {
          max-width: 1040px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }
        @media (max-width: 720px) {
          .ev-inner { grid-template-columns: 1fr; }
        }
        .ev-frame {
          position: relative;
          background: #FAF8F3;
          padding: 14px;
          border: 1px solid #E4D8C6;
          box-shadow: 0 18px 40px -25px rgba(124,27,43,.3);
          aspect-ratio: 4 / 5;
          overflow: hidden;
        }
        .ev-frame::before {
          content: '';
          position: absolute; inset: 6px;
          border: 1px solid #C9A96E; opacity: .35;
          pointer-events: none; z-index: 2;
        }
        .ev-img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .ev-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #F0E9DC, #E4D8C6);
          font-family: 'Noto Serif SC', 'Songti SC', serif;
          font-weight: 700;
          font-size: clamp(5rem, 12vw, 8rem);
          color: #7C1B2B;
          opacity: .6;
        }

        .ev-info {
          text-align: left;
        }
        @media (max-width: 720px) {
          .ev-info { text-align: center; }
        }
        .ev-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .68rem;
          letter-spacing: .38em;
          text-transform: uppercase;
          color: #C9A96E;
          margin-bottom: .65rem;
        }
        .ev-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(2.2rem, 5.5vw, 3rem);
          color: #7C1B2B;
          line-height: 1;
          margin: 0 0 1.5rem;
        }
        .ev-date {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2.6rem, 8vw, 4.5rem);
          color: #7C1B2B;
          line-height: 1;
          letter-spacing: -.01em;
          margin: 0 0 .6rem;
        }
        .ev-weekday {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .7rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: #7A5555;
          margin-bottom: .35rem;
        }
        .ev-time {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
          color: #231010;
          margin: 0 0 1.5rem;
        }
        .ev-time strong {
          font-weight: 600;
          color: #7C1B2B;
          font-style: normal;
        }
        .ev-divider {
          width: 80px; height: 1px;
          background: #C9A96E; opacity: .55;
          margin: 1.5rem 0;
        }
        @media (max-width: 720px) {
          .ev-divider { margin: 1.5rem auto; }
        }
        .ev-ceremony {
          display: grid;
          gap: .9rem;
        }
        .ev-ev {
          font-family: 'Cormorant Garamond', serif;
          color: #231010;
        }
        .ev-ev-label {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .62rem;
          letter-spacing: .3em;
          text-transform: uppercase;
          color: #C9A96E;
          margin-bottom: .25rem;
        }
        .ev-ev-line {
          font-size: clamp(.95rem, 1.9vw, 1.05rem);
          line-height: 1.6;
          margin: 0;
        }
        .ev-ev-line strong {
          font-weight: 600;
          color: #7C1B2B;
        }
      `}</style>

      <section className="ev-sec" aria-label="Chi tiết lễ cưới">
        <div className="ev-inner">
          <div className="ev-frame">
            {heroPhoto ? (
              <img src={heroPhoto} alt="" className="ev-img" loading="lazy" />
            ) : (
              <div className="ev-placeholder">囍</div>
            )}
          </div>

          <div className="ev-info">
            <span className="ev-eyebrow">Save the Date</span>
            <h2 className="ev-title">Hôn lễ</h2>

            <p className="ev-date">{dd}.{mm}.{yyyy}</p>
            <span className="ev-weekday">{weekday}</span>
            <p className="ev-time">Vào lúc <strong>{time}</strong></p>

            <div className="ev-divider" />

            <div className="ev-ceremony">
              <div className="ev-ev">
                <span className="ev-ev-label">Lễ Vu Quy / Thành Hôn</span>
                <p className="ev-ev-line">
                  <strong>09:00</strong> · Chủ Nhật · Tư gia
                </p>
              </div>
              <div className="ev-ev">
                <span className="ev-ev-label">Tiệc cưới</span>
                <p className="ev-ev-line">
                  <strong>{time}</strong> · {weekday}
                </p>
                <p className="ev-ev-line" style={{ fontStyle: 'italic', color: '#5C3535' }}>
                  {config?.venue_name ?? 'Nhà hàng Full House'}
                </p>
              </div>
              {config?.dresscode && (
                <div className="ev-ev">
                  <span className="ev-ev-label">Dresscode</span>
                  <p className="ev-ev-line" style={{ fontStyle: 'italic' }}>{config.dresscode}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
