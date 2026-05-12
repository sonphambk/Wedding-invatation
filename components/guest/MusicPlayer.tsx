'use client'
import { useEffect, useRef, useState } from 'react'

interface Props { musicUrl: string }

export default function MusicPlayer({ musicUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [labelVisible, setLabelVisible] = useState(false)

  useEffect(() => {
    function onOpen() {
      const audio = audioRef.current
      if (!audio) return
      audio.play()
        .then(() => {
          setPlaying(true)
          setLabelVisible(true)
          setTimeout(() => setLabelVisible(false), 3000)
        })
        .catch(() => {})
    }
    window.addEventListener('envelope-opened', onOpen)
    return () => window.removeEventListener('envelope-opened', onOpen)
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  return (
    <>
      <style>{`
        .music-player {
          position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 100;
          display: flex; flex-direction: column; align-items: flex-end; gap: .5rem;
        }
        .music-label {
          background: rgba(35,16,16,.85); color: #FAF8F3;
          font-family: 'Montserrat', sans-serif; font-size: .7rem;
          padding: .35rem .75rem; border-radius: 20px; white-space: nowrap;
          transition: opacity .4s; pointer-events: none;
        }
        .music-label.hidden { opacity: 0; }
        .music-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: #7C1B2B; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(124,27,43,.4); transition: transform .15s;
        }
        .music-btn:active { transform: scale(.92); }
        .music-btn.playing { animation: ripple 1.5s ease-out infinite; }
        @keyframes ripple {
          0%   { box-shadow: 0 4px 16px rgba(124,27,43,.4), 0 0 0 0 rgba(124,27,43,.4) }
          70%  { box-shadow: 0 4px 16px rgba(124,27,43,.4), 0 0 0 16px rgba(124,27,43,0) }
          100% { box-shadow: 0 4px 16px rgba(124,27,43,.4), 0 0 0 0 rgba(124,27,43,0) }
        }
        .music-icon { color: #FAF8F3; font-size: 1.1rem; line-height: 1; }
      `}</style>

      <audio ref={audioRef} loop preload="none" src={musicUrl} />

      <div className="music-player">
        <div className={`music-label${labelVisible ? '' : ' hidden'}`}>
          ♪ Nhạc nền đám cưới
        </div>
        <button
          className={`music-btn${playing ? ' playing' : ''}`}
          onClick={toggle}
          aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}
        >
          <span className="music-icon">{playing ? '⏸' : '▶'}</span>
        </button>
      </div>
    </>
  )
}
