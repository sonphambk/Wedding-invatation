import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function EventDetails({ config }: Props) {
  const dateStr = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'Thứ Bảy, 13 tháng 12, 2025'
  const timeStr = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit', hour12: false,
      }) + ' SA'
    : '11:00 SA'

  const items = [
    { icon: '📅', label: 'Ngày cưới', value: dateStr },
    { icon: '⏰', label: 'Thời gian', value: timeStr },
    { icon: '📍', label: 'Địa điểm',  value: config?.venue_name ?? 'Trung Tâm Tiệc Cưới Ánh Dương' },
    ...(config?.dresscode ? [{ icon: '👗', label: 'Trang phục', value: config.dresscode }] : []),
  ]

  return (
    <>
      <style>{`
        .details { padding: 2.5rem 1.5rem; background: #F0E9DC; }
        .details-title {
          font-family: 'Cormorant Garamond', serif; font-size: 1.4rem;
          color: #231010; text-align: center; margin-bottom: 1.5rem;
        }
        .details-card {
          background: #FAF8F3; border-radius: 12px; padding: 1rem 1.25rem;
          margin-bottom: .75rem; display: flex; align-items: flex-start; gap: .75rem;
        }
        .details-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: .1rem; }
        .details-label {
          font-family: 'Montserrat', sans-serif; font-size: .6rem;
          letter-spacing: .15em; text-transform: uppercase; color: #7A5555; margin-bottom: .2rem;
        }
        .details-value {
          font-family: 'Cormorant Garamond', serif; font-size: 1rem;
          color: #231010; line-height: 1.4;
        }
        .details-address {
          font-family: 'Montserrat', sans-serif; font-size: .75rem;
          color: #5C3535; margin-top: .25rem;
        }
      `}</style>

      <section className="details">
        <h2 className="details-title">Thông tin buổi lễ</h2>
        {items.map(({ icon, label, value }) => (
          <div key={label} className="details-card">
            <span className="details-icon">{icon}</span>
            <div>
              <p className="details-label">{label}</p>
              <p className="details-value">{value}</p>
              {label === 'Địa điểm' && config?.venue_address && (
                <p className="details-address">{config.venue_address}</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
