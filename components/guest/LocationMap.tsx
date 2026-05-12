import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function LocationMap({ config }: Props) {
  const mapsUrl = config?.maps_url
    ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4!2d106.7009!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3b5a1a6bc!2zUXXhuq1uIDEsIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1'
  const navUrl = config?.venue_address
    ? `https://maps.google.com/?q=${encodeURIComponent(config.venue_address)}`
    : 'https://maps.google.com/?q=Quận+1+TP.HCM'

  return (
    <>
      <style>{`
        .location { padding: 2.5rem 1.5rem; background: #FAF8F3; }
        .location-title {
          font-family: 'Cormorant Garamond', serif; font-size: 1.4rem;
          color: #231010; text-align: center; margin-bottom: 1.25rem;
        }
        .location-address {
          font-family: 'Montserrat', sans-serif; font-size: .8rem;
          color: #5C3535; text-align: center; margin-bottom: 1rem; line-height: 1.6;
        }
        .location-map { width: 100%; height: 200px; border-radius: 12px; border: none; display: block; }
        .location-btn {
          display: block; width: 100%; margin-top: 1rem; padding: .85rem;
          border-radius: 12px; background: #7C1B2B; color: #FAF8F3;
          text-align: center; font-family: 'Montserrat', sans-serif;
          font-size: .8rem; font-weight: 500; text-decoration: none;
          letter-spacing: .05em; transition: background .15s;
        }
        .location-btn:hover { background: #9B2F3F; }
      `}</style>

      <section className="location">
        <h2 className="location-title">Địa điểm</h2>
        <p className="location-address">
          {config?.venue_name ?? 'Trung Tâm Tiệc Cưới Ánh Dương'}<br />
          {config?.venue_address ?? 'Quận 1, TP.HCM'}
        </p>
        <iframe
          src={mapsUrl}
          className="location-map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ địa điểm"
          allowFullScreen
        />
        <a href={navUrl} target="_blank" rel="noopener noreferrer" className="location-btn">
          🗺 Chỉ đường
        </a>
      </section>
    </>
  )
}
