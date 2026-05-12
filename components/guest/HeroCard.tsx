import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function HeroCard({ config }: Props) {
  const bride = config?.bride_name ?? 'Ái Nhãn'
  const groom = config?.groom_name ?? 'Ngọc Sơn'
  const date = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : 'Thứ Bảy, 13.12.2025'

  return (
    <>
      <style>{`
        .hero {
          min-height: 100svh; background: #FAF8F3;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem 2rem; text-align: center; position: relative; overflow: hidden;
        }
        .hero-watermark {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 18rem; color: #C9A96E; opacity: .05;
          pointer-events: none; font-family: serif; user-select: none; line-height: 1;
        }
        .hero-kinhm {
          font-family: 'Montserrat', sans-serif; font-size: .7rem;
          letter-spacing: .25em; color: #7A5555;
          text-transform: uppercase; margin-bottom: 1.5rem;
        }
        .hero-names {
          font-family: 'Great Vibes', cursive; font-size: 3.5rem;
          color: #231010; line-height: 1.2; margin-bottom: .5rem;
        }
        .hero-amp {
          font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;
          color: #C9A96E; margin: .25rem 0; font-style: italic;
        }
        .hero-date {
          font-family: 'Cormorant Garamond', serif; font-size: 1rem;
          color: #5C3535; margin-top: 1.5rem; letter-spacing: .05em;
        }
        .hero-divider {
          margin: 1.5rem auto; display: flex; align-items: center; gap: .5rem; width: 100%;
        }
        .hero-divider-line { flex: 1; height: 1px; background: #E4D8C6; }
        .hero-divider-diamond {
          width: 6px; height: 6px; background: #C9A96E; transform: rotate(45deg);
        }
        .hero-invitation {
          font-family: 'Cormorant Garamond', serif; font-size: .95rem;
          color: #5C3535; line-height: 1.8; max-width: 280px; margin: 0 auto; font-style: italic;
        }
      `}</style>

      <section className="hero">
        <div className="hero-watermark" aria-hidden="true">囍</div>
        <p className="hero-kinhm">Trân trọng kính mời</p>
        <p className="hero-names">{groom}</p>
        <p className="hero-amp">&amp;</p>
        <p className="hero-names">{bride}</p>
        <div className="hero-divider">
          <div className="hero-divider-line" />
          <div className="hero-divider-diamond" />
          <div className="hero-divider-line" />
        </div>
        <p className="hero-date">{date}</p>
        <div className="hero-divider">
          <div className="hero-divider-line" />
          <div className="hero-divider-diamond" />
          <div className="hero-divider-line" />
        </div>
        <p className="hero-invitation">
          Chúng tôi trân trọng kính mời quý vị<br />
          đến chung vui trong ngày thành hôn<br />
          của chúng tôi.
        </p>
      </section>
    </>
  )
}
