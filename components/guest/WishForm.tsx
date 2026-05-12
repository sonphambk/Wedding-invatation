'use client'
import { useState, FormEvent } from 'react'

interface Props {
  onWishSubmitted?: () => void
}

export default function WishForm({ onWishSubmitted }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_name: name, message }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Gửi thất bại, vui lòng thử lại')
    } else {
      setDone(true)
      setName('')
      setMessage('')
      onWishSubmitted?.()
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #E4D8C6', borderRadius: 10,
    padding: '.75rem 1rem', fontFamily: "'Montserrat', sans-serif",
    fontSize: '.85rem', color: '#231010', background: '#FAF8F3',
    outline: 'none', width: '100%',
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(201,169,110,.1)', borderRadius: 12 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#231010' }}>
          ♥ Cảm ơn lời chúc của bạn!
        </p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem', color: '#7A5555', marginTop: '.5rem' }}>
          Lời chúc sẽ hiển thị sau khi được duyệt.
        </p>
        <button
          onClick={() => setDone(false)}
          style={{ marginTop: '1rem', fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem', color: '#7C1B2B', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Gửi lời chúc khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <input
        type="text" placeholder="Tên của bạn *"
        value={name} onChange={(e) => setName(e.target.value)}
        required maxLength={100} style={inputStyle}
      />
      <textarea
        placeholder="Lời chúc của bạn *"
        value={message} onChange={(e) => setMessage(e.target.value)}
        required maxLength={500} rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      {error && (
        <p style={{ color: '#c0392b', fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem' }}>{error}</p>
      )}
      <button
        type="submit" disabled={loading}
        style={{
          background: '#7C1B2B', color: '#FAF8F3', border: 'none', borderRadius: 10,
          padding: '.85rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
          fontSize: '.85rem', cursor: 'pointer', opacity: loading ? .6 : 1, transition: 'opacity .15s',
        }}
      >
        {loading ? 'Đang gửi...' : '💌 Gửi lời chúc'}
      </button>
    </form>
  )
}
