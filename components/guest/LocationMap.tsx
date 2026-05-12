import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

function toEmbedSrc(savedUrl: string | null | undefined, address: string | null | undefined): string {
  const url = (savedUrl || '').trim()
  // Already an embed iframe URL — use as-is
  if (url && (url.includes('/maps/embed') || url.includes('output=embed'))) {
    return url
  }
  // Anything else (short link maps.app.goo.gl, share link, place URL, empty) →
  // build a working iframe-embeddable URL from the address. The classic
  // `maps.google.com/maps?q=...&output=embed` endpoint works without an API key
  // and is iframe-friendly (no X-Frame-Options block).
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
        .loc {
          padding: clamp(3rem, 7vw, 5rem) 1.5rem;
          background: #F0E9DC;
        }
        .loc-inner { max-width: 640px; margin: 0 auto; text-align: center; }
        .loc-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .68rem; letter-spacing: .38em;
          text-transform: uppercase; color: #C9A96E;
          margin-bottom: .75rem;
        }
        .loc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 4.5vw, 2.8rem);
          color: #7C1B2B; font-weight: 400;
          margin: 0 0 1.25rem;
        }
        .loc-orn {
          display: flex; align-items: center; justify-content: center;
          gap: 1rem; margin: 1.25rem auto 2rem;
        }
        .loc-orn-line { flex: 1; max-width: 80px; height: 1px; background: #C9A96E; opacity: .6; }
        .loc-orn-dot {
          width: 6px; height: 6px; background: #C9A96E;
          transform: rotate(45deg);
        }
        .loc-venue {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-weight: 500; color: #231010;
          margin: 0 0 .5rem; letter-spacing: .02em;
        }
        .loc-address {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(.9rem, 1.6vw, 1.05rem);
          color: #5C3535; line-height: 1.7;
          margin: 0 0 2rem;
        }
        .loc-frame {
          position: relative;
          background: #FAF8F3;
          padding: 14px;
          border: 1px solid #E4D8C6;
          box-shadow: 0 18px 40px -25px rgba(124,27,43,.3);
        }
        .loc-frame::before {
          content: ''; position: absolute; inset: 6px;
          border: 1px solid #C9A96E; opacity: .35;
          pointer-events: none; z-index: 2;
        }
        .loc-map {
          width: 100%; height: clamp(220px, 40vw, 340px);
          border: none; display: block;
          filter: saturate(.9) contrast(.95);
        }
        .loc-actions {
          display: flex; flex-wrap: wrap; gap: .75rem;
          justify-content: center; margin-top: 2rem;
        }
        .loc-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .85rem 1.6rem;
          font-family: 'Montserrat', sans-serif;
          font-size: .7rem; letter-spacing: .25em; text-transform: uppercase;
          text-decoration: none; cursor: pointer;
          transition: background .25s, color .25s;
        }
        .loc-btn-primary {
          background: #7C1B2B; color: #FAF8F3;
          border: 1px solid #7C1B2B;
        }
        .loc-btn-primary:hover { background: #5A1120; }
        .loc-btn-secondary {
          background: transparent; color: #7C1B2B;
          border: 1px solid #7C1B2B;
        }
        .loc-btn-secondary:hover { background: #7C1B2B; color: #FAF8F3; }
      `}</style>

      <section className="loc">
        <div className="loc-inner">
          <span className="loc-eyebrow">Địa điểm</span>
          <h2 className="loc-title">Nơi diễn ra buổi lễ</h2>

          <div className="loc-orn">
            <span className="loc-orn-line" />
            <span className="loc-orn-dot" />
            <span className="loc-orn-line" />
          </div>

          <p className="loc-venue">
            {config?.venue_name ?? 'Trung Tâm Tiệc Cưới Ánh Dương'}
          </p>
          <p className="loc-address">
            {config?.venue_address ?? 'Quận 1, TP.HCM'}
          </p>

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

          <div className="loc-actions">
            <a href={navUrl} target="_blank" rel="noopener noreferrer" className="loc-btn loc-btn-primary">
              Mở chỉ đường
            </a>
            <a href="/api/calendar.ics" download="wedding.ics" className="loc-btn loc-btn-secondary">
              Lưu vào lịch
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
