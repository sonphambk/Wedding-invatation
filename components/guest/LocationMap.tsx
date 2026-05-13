import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

function toEmbedSrc(savedUrl: string | null | undefined, address: string | null | undefined): string {
  const url = (savedUrl || '').trim()
  if (url && (url.includes('/maps/embed') || url.includes('output=embed'))) return url
  const q = (address || '').trim() || 'Quận 1, TP.HCM'
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&hl=vi&z=16&output=embed`
}

export default function LocationMap({ config }: Props) {
  const mapsUrl = toEmbedSrc(config?.maps_url, config?.venue_address)
  const navUrl = config?.maps_url
    || (config?.venue_address
      ? `https://maps.google.com/?q=${encodeURIComponent(config.venue_address)}`
      : 'https://maps.google.com/?q=Quận+1+TP.HCM')

  return (
    <>
      <style>{`
        .loc-sec {
          padding: clamp(3rem, 7vw, 5rem) clamp(1.25rem, 4vw, 2rem);
          background: #F0E9DC;
        }
        .loc-inner {
          max-width: 1040px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }
        @media (max-width: 720px) {
          .loc-inner { grid-template-columns: 1fr; }
        }

        .loc-frame {
          position: relative;
          background: #FAF8F3;
          padding: 12px;
          border: 1px solid #E4D8C6;
          box-shadow: 0 18px 40px -25px rgba(124,27,43,.3);
        }
        .loc-frame::before {
          content: ''; position: absolute; inset: 6px;
          border: 1px solid var(--color-accent); opacity: .35;
          pointer-events: none; z-index: 2;
        }
        .loc-map {
          width: 100%;
          height: clamp(260px, 38vw, 380px);
          border: none; display: block;
          filter: saturate(.9) contrast(.95);
        }

        .loc-info { text-align: left; }
        @media (max-width: 720px) {
          .loc-info { text-align: center; }
        }

        .loc-eyebrow {
          display: block;
          font-family: var(--font-body);
          font-size: .68rem; letter-spacing: .38em;
          text-transform: uppercase; color: var(--color-accent);
          margin-bottom: .65rem;
        }
        .loc-title {
          font-family: var(--font-script);
          font-size: calc(clamp(2.2rem, 5.5vw, 3rem) * var(--scale-heading, 1));
          color: var(--color-primary);
          line-height: 1;
          margin: 0 0 1.5rem;
        }
        .loc-venue {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: calc(clamp(1.2rem, 2.6vw, 1.45rem) * var(--scale-heading, 1));
          color: #231010;
          margin: 0 0 .55rem;
          letter-spacing: .02em;
          text-transform: uppercase;
        }
        .loc-address {
          font-family: var(--font-heading);
          font-style: italic;
          font-size: clamp(.95rem, 1.8vw, 1.05rem);
          color: #5C3535;
          line-height: 1.7;
          margin: 0 0 1.5rem;
        }
        .loc-actions {
          display: flex; flex-wrap: wrap; gap: .75rem;
          margin-top: 1.5rem;
        }
        @media (max-width: 720px) {
          .loc-actions { justify-content: center; }
        }
        .loc-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .85rem 1.6rem;
          font-family: var(--font-body);
          font-size: .68rem; letter-spacing: .25em; text-transform: uppercase;
          text-decoration: none; cursor: pointer;
          transition: background .25s, color .25s;
        }
        .loc-btn-primary {
          background: var(--color-primary); color: #FAF8F3;
          border: 1px solid var(--color-primary);
        }
        .loc-btn-primary:hover { background: #5A1120; }
        .loc-btn-secondary {
          background: transparent; color: var(--color-primary);
          border: 1px solid var(--color-primary);
        }
        .loc-btn-secondary:hover { background: var(--color-primary); color: #FAF8F3; }
      `}</style>

      <section className="loc-sec" aria-label="Địa điểm">
        <div className="loc-inner">
          <div className="loc-frame">
            <iframe
              src={mapsUrl}
              className="loc-map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ địa điểm"
              allowFullScreen
            />
          </div>
          <div className="loc-info">
            <span className="loc-eyebrow">Địa điểm tổ chức</span>
            <h2 className="loc-title">Nơi diễn ra</h2>
            <p className="loc-venue">{config?.venue_name ?? 'Nhà hàng Full House'}</p>
            <p className="loc-address">
              {config?.venue_address ?? '64 Trần Phú, Phường Quảng Trị, Tỉnh Quảng Trị'}
            </p>
            <div className="loc-actions">
              <a href={navUrl} target="_blank" rel="noopener noreferrer" className="loc-btn loc-btn-primary">
                Xem chỉ đường
              </a>
              <a href="/api/calendar.ics" download="wedding.ics" className="loc-btn loc-btn-secondary">
                Lưu vào lịch
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
