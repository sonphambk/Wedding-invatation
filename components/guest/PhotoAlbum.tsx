'use client'
import { useState } from 'react'
import { PhotoEntry } from '@/lib/types'

interface Props { photos: PhotoEntry[] }

// Generic Vietnamese wedding-moment captions cycled across photos.
// Each caption has a script eyebrow + body text.
const CAPTIONS: { eyebrow: string; body: string }[] = [
  { eyebrow: 'Khoảnh khắc đầu tiên', body: 'Có những ngày bình thường mà mình mãi nhớ — vì có em ở đó.' },
  { eyebrow: 'Cùng nhau', body: 'Hạnh phúc không phải là điểm đến, mà là hành trình ta đi bên nhau.' },
  { eyebrow: 'Lời hứa', body: 'Anh sẽ chăm sóc em mỗi ngày, qua cả những điều giản dị nhất.' },
  { eyebrow: 'Mãi mãi', body: 'Cảm ơn vì đã chọn anh — người yêu mãi mãi của em.' },
  { eyebrow: 'Nắm tay', body: 'Một bàn tay đủ ấm để vượt qua mọi mùa đông.' },
  { eyebrow: 'Nụ cười', body: 'Mỗi nụ cười của em là một lý do để anh tin vào tình yêu.' },
  { eyebrow: 'Ánh mắt', body: 'Trong ánh mắt em, anh nhìn thấy cả tương lai của chúng mình.' },
  { eyebrow: 'Bình yên', body: 'Bình yên không phải nơi nào xa — bình yên là khi có em.' },
  { eyebrow: 'Yêu', body: 'Yêu là chọn nhau mỗi ngày, dù trời nắng hay mưa.' },
  { eyebrow: 'Chung đôi', body: 'Hôm nay chúng mình về chung một nhà — bắt đầu chương đẹp nhất.' },
  { eyebrow: 'Hạnh phúc', body: 'Cảm ơn cuộc đời đã cho chúng mình tìm thấy nhau.' },
  { eyebrow: 'Khởi đầu', body: 'Một khởi đầu mới — với tất cả niềm tin và yêu thương.' },
]

export default function PhotoAlbum({ photos }: Props) {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  return (
    <>
      <style>{`
        .pa-sec {
          background: #FAF6EE;
          padding: clamp(3rem, 7vw, 5rem) clamp(1rem, 3vw, 2rem);
          position: relative;
          overflow: hidden;
        }
        .pa-sec::before {
          content: '';
          position: absolute;
          left: 50%;
          top: clamp(8rem, 16vw, 12rem);
          bottom: clamp(4rem, 10vw, 8rem);
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(201,169,110,.4) 8%, rgba(201,169,110,.4) 92%, transparent);
          pointer-events: none;
        }
        @media (max-width: 720px) {
          .pa-sec::before { display: none; }
        }
        .pa-inner {
          position: relative;
          max-width: 1040px;
          margin: 0 auto;
        }
        .pa-head { text-align: center; margin-bottom: clamp(2.5rem, 6vw, 4rem); }
        .pa-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: .68rem; letter-spacing: .38em;
          text-transform: uppercase; color: #C9A96E;
          margin-bottom: .6rem;
        }
        .pa-title {
          font-family: 'Great Vibes', cursive;
          font-size: clamp(2.4rem, 6vw, 3.4rem);
          color: #7C1B2B;
          line-height: 1;
          margin: 0 0 .5rem;
        }
        .pa-sub {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(.9rem, 1.8vw, 1.05rem);
          color: #5C3535;
          margin: 0;
        }

        .pa-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
          margin-bottom: clamp(2.5rem, 6vw, 4rem);
          position: relative;
        }
        .pa-row:last-child { margin-bottom: 0; }
        .pa-row.right { direction: rtl; }
        .pa-row.right > * { direction: ltr; }
        @media (max-width: 720px) {
          .pa-row { grid-template-columns: 1fr; gap: 1.25rem; }
          .pa-row.right { direction: ltr; }
        }

        .pa-frame {
          position: relative;
          background: #FAF8F3;
          padding: 10px;
          border: 1px solid #E4D8C6;
          box-shadow: 0 18px 40px -22px rgba(124,27,43,.32);
          cursor: zoom-in;
          overflow: hidden;
          transition: transform .4s ease, box-shadow .4s ease;
        }
        .pa-frame::before {
          content: ''; position: absolute; inset: 5px;
          border: 1px solid #C9A96E; opacity: .3;
          pointer-events: none; z-index: 2;
        }
        .pa-frame:hover {
          transform: translateY(-3px);
          box-shadow: 0 22px 50px -22px rgba(124,27,43,.4);
        }
        .pa-img {
          width: 100%;
          height: auto;
          display: block;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          transition: transform .6s ease;
        }
        .pa-frame:hover .pa-img { transform: scale(1.03); }

        .pa-caption {
          font-family: 'Cormorant Garamond', serif;
          padding: clamp(.5rem, 1.5vw, 1rem) 0;
        }
        .pa-row.right .pa-caption { text-align: right; }
        @media (max-width: 720px) {
          .pa-row.right .pa-caption,
          .pa-caption { text-align: center; }
        }

        .pa-cap-num {
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
          font-size: .62rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: #C9A96E;
          margin-bottom: .5rem;
        }
        .pa-cap-eyebrow {
          display: block;
          font-family: 'Great Vibes', cursive;
          font-size: clamp(1.8rem, 5vw, 2.4rem);
          color: #7C1B2B;
          line-height: 1.1;
          margin-bottom: .8rem;
        }
        .pa-cap-body {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: clamp(.95rem, 2vw, 1.1rem);
          color: #5C3535;
          line-height: 1.75;
          margin: 0;
          max-width: 32ch;
        }
        .pa-row.right .pa-cap-body {
          margin-left: auto;
        }
        @media (max-width: 720px) {
          .pa-row.right .pa-cap-body,
          .pa-cap-body { margin-left: auto; margin-right: auto; }
        }

        .pa-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 10px; height: 10px;
          background: #C9A96E;
          border: 2px solid #FAF6EE;
          border-radius: 50%;
          box-shadow: 0 0 0 1px #C9A96E;
          z-index: 1;
        }
        @media (max-width: 720px) {
          .pa-dot { display: none; }
        }

        .pa-lightbox {
          position: fixed; inset: 0;
          background: rgba(20, 10, 12, .92);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
          cursor: zoom-out;
          animation: paFade .25s ease;
        }
        @keyframes paFade { from { opacity: 0 } to { opacity: 1 } }
        .pa-lightbox img {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          box-shadow: 0 30px 80px rgba(0,0,0,.5);
        }
        .pa-lightbox-close {
          position: absolute;
          top: 1.2rem; right: 1.2rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,.4);
          color: #FAF8F3;
          width: 38px; height: 38px;
          font-size: 1.1rem;
          cursor: pointer;
          font-family: inherit;
        }
        .pa-nav {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.3);
          color: #FAF8F3;
          width: 44px; height: 44px;
          font-size: 1.4rem;
          cursor: pointer;
          font-family: inherit;
        }
        .pa-nav-prev { left: 1rem; }
        .pa-nav-next { right: 1rem; }
      `}</style>

      <section className="pa-sec" aria-label="Album cưới">
        <div className="pa-inner">
          <div className="pa-head">
            <span className="pa-eyebrow">Khoảnh khắc</span>
            <h2 className="pa-title">Album hình cưới</h2>
            <p className="pa-sub">Những kỷ niệm chúng mình thương nhớ nhất</p>
          </div>

          {sorted.map((p, i) => {
            const cap = CAPTIONS[i % CAPTIONS.length]
            const align = i % 2 === 0 ? 'left' : 'right'
            return (
              <div key={p.url + i} className={`pa-row ${align}`}>
                <div className="pa-frame" onClick={() => setLightboxIdx(i)}>
                  <img src={p.url} alt={cap.eyebrow} className="pa-img" loading="lazy" />
                </div>
                <div className="pa-caption">
                  <span className="pa-cap-num">{String(i + 1).padStart(2, '0')} · Moment</span>
                  <span className="pa-cap-eyebrow">{cap.eyebrow}</span>
                  <p className="pa-cap-body">{cap.body}</p>
                </div>
                <span className="pa-dot" aria-hidden="true" />
              </div>
            )
          })}
        </div>
      </section>

      {lightboxIdx !== null && sorted[lightboxIdx] && (
        <div className="pa-lightbox" onClick={() => setLightboxIdx(null)} role="dialog" aria-label="Xem ảnh">
          <button
            className="pa-lightbox-close"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null) }}
            aria-label="Đóng"
          >
            ×
          </button>
          {lightboxIdx > 0 && (
            <button
              className="pa-nav pa-nav-prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => (i ?? 0) - 1) }}
              aria-label="Ảnh trước"
            >
              ‹
            </button>
          )}
          {lightboxIdx < sorted.length - 1 && (
            <button
              className="pa-nav pa-nav-next"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => (i ?? 0) + 1) }}
              aria-label="Ảnh sau"
            >
              ›
            </button>
          )}
          <img src={sorted[lightboxIdx].url} alt="" />
        </div>
      )}
    </>
  )
}
