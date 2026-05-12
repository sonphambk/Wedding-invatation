import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function ParentsSection({ config }: Props) {
  void config

  const groomFather = 'Ông: PHẠM VĂN ĐIỂN'
  const groomMother = 'Bà: VĂN THỊ HƯƠNG'
  const groomLocation = 'Phường Quảng Trị, Tỉnh Quảng Trị'

  const brideFather = 'Ông: HOÀNG ĐỨC NHÂN'
  const brideMother = 'Bà: LỄ THỊ QUY HƯƠNG'
  const brideLocation = 'Thôn Ải Tử, Phường Quảng Trị, Tỉnh Quảng Trị'

  return (
    <>
      <style>{`
        .parents-sec {
          background: #FAF6EE;
          padding: clamp(3rem, 7vw, 5rem) clamp(1.25rem, 4vw, 2rem);
          position: relative;
          overflow: hidden;
        }
        .parents-sec::before {
          content: '囍';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Noto Serif SC', 'Songti SC', serif;
          font-weight: 700;
          font-size: clamp(220px, 50vw, 540px);
          color: #7C1B2B;
          opacity: .035;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }
        .parents-inner {
          position: relative;
          z-index: 1;
          max-width: 880px;
          margin: 0 auto;
        }
        .parents-quote {
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(1rem, 2.2vw, 1.25rem);
          color: #5C3535;
          line-height: 1.7;
          max-width: 620px;
          margin: 0 auto clamp(2rem, 5vw, 3rem);
        }
        .parents-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: clamp(1rem, 3vw, 2rem);
        }
        .parents-side {
          text-align: center;
        }
        .parents-label {
          display: inline-block;
          font-family: 'Great Vibes', cursive;
          font-size: clamp(1.5rem, 4vw, 2rem);
          color: #7C1B2B;
          margin-bottom: 1rem;
          line-height: 1;
        }
        .parents-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(.92rem, 1.9vw, 1.05rem);
          letter-spacing: .04em;
          color: #231010;
          line-height: 1.85;
          margin: 0;
        }
        .parents-loc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(.85rem, 1.7vw, .98rem);
          color: #5C3535;
          margin-top: .65rem;
        }
        .parents-divider {
          width: 1px;
          height: clamp(120px, 18vw, 180px);
          background: linear-gradient(to bottom, transparent, #C9A96E 25%, #C9A96E 75%, transparent);
          opacity: .55;
          position: relative;
        }
        .parents-divider::after {
          content: '✦';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #FAF6EE;
          color: #C9A96E;
          font-size: 1rem;
          padding: 0 .4rem;
        }
        @media (max-width: 560px) {
          .parents-row {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .parents-divider {
            width: 60%;
            height: 1px;
            background: linear-gradient(to right, transparent, #C9A96E 25%, #C9A96E 75%, transparent);
            margin: 0 auto;
          }
        }
      `}</style>

      <section className="parents-sec" aria-label="Gia đình">
        <div className="parents-inner">
          <p className="parents-quote">
            &ldquo;Hôn nhân là chuyện cả đời,<br />
            yêu người vừa ý, cưới người mình thương...&rdquo;
          </p>
          <div className="parents-row">
            <div className="parents-side">
              <span className="parents-label">Nhà Trai</span>
              <p className="parents-name">{groomFather}</p>
              <p className="parents-name">{groomMother}</p>
              <p className="parents-loc">{groomLocation}</p>
            </div>
            <div className="parents-divider" aria-hidden="true" />
            <div className="parents-side">
              <span className="parents-label">Nhà Gái</span>
              <p className="parents-name">{brideFather}</p>
              <p className="parents-name">{brideMother}</p>
              <p className="parents-loc">{brideLocation}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
