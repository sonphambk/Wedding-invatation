import { WeddingConfig } from '@/lib/types'
import { vietqrUrl, VN_BANKS } from '@/lib/vietqr'

interface Props { config: WeddingConfig }

function BankCard({ code, account, holder }: { code: string; account: string; holder: string }) {
  const qr = vietqrUrl(code, account)
  const bankName = VN_BANKS[code] ?? code

  return (
    <div style={{
      background: '#FAF8F3', border: '1px solid #E4D8C6',
      borderRadius: 16, padding: '1.25rem', marginBottom: '1rem', textAlign: 'center',
    }}>
      <p style={{
        fontFamily: "'Montserrat', sans-serif", fontSize: '.65rem',
        letterSpacing: '.15em', textTransform: 'uppercase', color: '#7A5555', marginBottom: '.5rem',
      }}>
        {bankName}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qr}
        alt={`QR ${bankName} ${account}`}
        style={{
          width: 180, height: 180, borderRadius: 8,
          margin: '0 auto .75rem', display: 'block', background: '#f0f0f0',
        }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem',
        color: '#231010', fontWeight: 600,
      }}>
        {account}
      </p>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem', color: '#5C3535', marginTop: '.25rem' }}>
        {holder}
      </p>
    </div>
  )
}

export default function BankQR({ config }: Props) {
  return (
    <>
      <style>{`
        .bankqr { padding: 2.5rem 1.5rem; background: #F0E9DC; }
        .bankqr-title {
          font-family: 'Cormorant Garamond', serif; font-size: 1.4rem;
          color: #231010; text-align: center; margin-bottom: .5rem;
        }
        .bankqr-sub {
          font-family: 'Montserrat', sans-serif; font-size: .75rem;
          color: #7A5555; text-align: center; margin-bottom: 1.5rem;
        }
      `}</style>

      <section className="bankqr">
        <h2 className="bankqr-title">🎁 Mừng cưới</h2>
        <p className="bankqr-sub">Quét mã để chuyển khoản mừng cưới</p>
        {config.bank1_code && config.bank1_account && config.bank1_holder && (
          <BankCard code={config.bank1_code} account={config.bank1_account} holder={config.bank1_holder} />
        )}
        {config.bank2_code && config.bank2_account && config.bank2_holder && (
          <BankCard code={config.bank2_code} account={config.bank2_account} holder={config.bank2_holder} />
        )}
      </section>
    </>
  )
}
