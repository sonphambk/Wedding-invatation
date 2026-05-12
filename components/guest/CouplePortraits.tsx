import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function CouplePortraits({ config }: Props) {
  const photos = config?.photos ?? []
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order)
  const groomPhoto = sorted[1]?.url ?? sorted[0]?.url ?? null
  const bridePhoto = sorted[2]?.url ?? sorted[0]?.url ?? null

  const groomFull = 'Phạm Ngọc Sơn'
  const brideFull = 'Hoàng Thị Ái Nhãn'

  return (
    <>
      <style>{`
        .cp-sec {
          background: #F5EFE3;
          padding: clamp(3rem, 7vw, 5rem) clamp(1.25rem, 4vw, 2rem);
        }
        .cp-inner {
          max-width: 960px;
          margin: 0 auto;
        }
        .cp-eyebrow {
          display: block;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-size: .68rem;
          letter-spacing: .38em;
          text-transform: uppercase;
          color: #C9A96E;
          margin-bottom: .6rem;
        }
        .cp-title {
          text-align: center;
          font-family: 'Great Vibes', cursive;
          font-size: clamp(2rem, 5.5vw, 3rem);
          color: #7C1B2B;
          line-height: 1;
          margin: 0 0 clamp(2rem, 5vw, 3rem);
        }
        .cp-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1.5rem, 4vw, 3rem);
          align-items: stretch;
        }
        .cp-card {
          text-align: center;
        }
        .cp-frame {
          position: relative;
          background: #FAF8F3;
          padding: 12px;
          border: 1px solid #E4D8C6;
          box-shadow: 0 18px 40px -25px rgba(124,27,43,.3);
          aspect-ratio: 3 / 4;
          overflow: hidden;
        }
        .cp-frame::before {
          content: '';
          position: absolute; inset: 6px;
          border: 1px solid #C9A96E; opacity: .35;
          pointer-events: none; z-index: 2;
        }
        .cp-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .cp-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Great Vibes', cursive;
          font-size: clamp(3rem, 8vw, 5rem);
          color: #C9A96E;
          background: linear-gradient(135deg, #F0E9DC, #E4D8C6);
        }
        .cp-role {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .65rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: #7A5555;
          margin-top: 1.25rem;
        }
        .cp-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: clamp(1.2rem, 2.8vw, 1.55rem);
          color: #7C1B2B;
          margin: .5rem 0 0;
          letter-spacing: .02em;
        }
        @media (max-width: 520px) {
          .cp-row { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>

      <section className="cp-sec" aria-label="Cô dâu - Chú rể">
        <div className="cp-inner">
          <span className="cp-eyebrow">Cô Dâu &amp; Chú Rể</span>
          <h2 className="cp-title">The Couple</h2>

          <div className="cp-row">
            <div className="cp-card">
              <div className="cp-frame">
                {groomPhoto ? (
                  <img src={groomPhoto} alt="Chú rể" className="cp-img" loading="lazy" />
                ) : (
                  <div className="cp-placeholder">N.S.</div>
                )}
              </div>
              <span className="cp-role">Chú rể · Trưởng Nam</span>
              <p className="cp-name">{groomFull}</p>
            </div>

            <div className="cp-card">
              <div className="cp-frame">
                {bridePhoto ? (
                  <img src={bridePhoto} alt="Cô dâu" className="cp-img" loading="lazy" />
                ) : (
                  <div className="cp-placeholder">A.N.</div>
                )}
              </div>
              <span className="cp-role">Cô dâu · Trưởng Nữ</span>
              <p className="cp-name">{brideFull}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
