'use client'
import { WeddingConfig } from '@/lib/types'
import HeroCard from './HeroCard'
import MusicPlayer from './MusicPlayer'
import CountdownTimer from './CountdownTimer'
import EventDetails from './EventDetails'
import PhotoAlbum from './PhotoAlbum'
import LocationMap from './LocationMap'
import BankQR from './BankQR'
import WishesWall from './WishesWall'
import Petals from './Petals'

interface Props { config: WeddingConfig | null; guestName?: string }

export default function GuestInvitation({ config, guestName }: Props) {
  const weddingDate = config?.wedding_date ?? '2026-07-03T11:00:00+07:00'

  return (
    <div id="main-content" style={{ display: 'none' }}>
      <Petals count={16} />
      <HeroCard config={config} guestName={guestName} />
      {config?.music_url && <MusicPlayer musicUrl={config.music_url} />}
      <CountdownTimer weddingDate={weddingDate} />
      <EventDetails config={config} />
      {config?.photos && config.photos.length > 0 && (
        <PhotoAlbum photos={config.photos} />
      )}
      <LocationMap config={config} />
      {(config?.bank1_account || config?.bank2_account) && config && (
        <BankQR config={config} />
      )}
      <WishesWall />
      <footer style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: '#F0E9DC' }}>
        <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2rem', color: '#7C1B2B' }}>
          {config?.groom_name ?? 'Ngọc Sơn'} &amp; {config?.bride_name ?? 'Ái Nhãn'}
        </p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '.8rem', color: '#7A5555', marginTop: '.5rem' }}>
          {config?.wedding_date
            ? new Date(config.wedding_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '03.07.2026'}
        </p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '.7rem', color: '#7A5555', marginTop: '1rem' }}>
          Made with ♥
        </p>
      </footer>
    </div>
  )
}
