import { WeddingConfig } from "@/lib/types";

interface Props {
  config: WeddingConfig | null;
  guestName?: string;
}

export default function HeroCard({ config, guestName }: Props) {
  const bride = (config?.bride_name ?? "Ái Nhãn").toUpperCase();
  const groom = (config?.groom_name ?? "Ngọc Sơn").toUpperCase();
  const d = config?.wedding_date
    ? new Date(config.wedding_date)
    : new Date("2026-07-05");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return (
    <>
      <style>{`
        .hero {
          position: relative;
          min-height: 100svh;
          display: flex; align-items: center; justify-content: center;
          background: #FAF8F3;
          overflow: hidden;
          padding: 2rem 1.25rem;
        }
        /* corner brackets */
        .hero::before, .hero::after {
          content: ''; position: absolute;
          width: clamp(40px, 6vw, 64px); height: clamp(40px, 6vw, 64px);
          border-color: #C9A96E; border-style: solid; opacity: .45;
          pointer-events: none;
        }
        .hero::before { top: clamp(18px, 3vw, 32px); left: clamp(18px, 3vw, 32px); border-width: 1px 0 0 1px; }
        .hero::after  { bottom: clamp(18px, 3vw, 32px); right: clamp(18px, 3vw, 32px); border-width: 0 1px 1px 0; }

        /* giant 囍 watermark */
        .hero-watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: serif;
          font-size: clamp(260px, 50vw, 620px);
          color: #7C1B2B; opacity: .04;
          line-height: 1; user-select: none; pointer-events: none;
        }

        .hero-inner {
          position: relative; z-index: 2;
          text-align: center; width: 100%;
          max-width: 880px;
        }

        /* DATE + SAVE THE DATE STACK */
        .date-stack {
          position: relative;
          display: inline-block;
          margin: 0 auto clamp(3.5rem, 8vw, 5.5rem);
          padding: clamp(.5rem, 2vw, 1.5rem) clamp(.5rem, 4vw, 2rem) 0;
        }
        .save-bg {
          position: absolute;
          left: 50%;
          top: 50%;
          bottom: auto;
          transform: translate(-50%, 70%) rotate(-5deg);
          font-family: 'Great Vibes', cursive;
          font-weight: 400;
          font-size: clamp(2.6rem, 8vw, 5.4rem);
          color: #f4cabd;
          opacity: .85;
          line-height: 1;
          letter-spacing: .015em;
          pointer-events: none; user-select: none;
          white-space: nowrap;
          z-index: 1;
          animation: fadeIn 1.4s ease both .55s;
        }
        .hero-date {
          position: relative;
          z-index: 2;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: clamp(3.6rem, 13vw, 9rem);
          color: #7C1B2B;
          line-height: .9;
          letter-spacing: -.02em;
          margin: 0;
          animation: fadeUp 1.1s ease both .25s;
        }

        .hero-rule { display: none; }

        .hero-names {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.4rem, 4.2vw, 2.8rem);
          letter-spacing: .14em;
          color: #7C1B2B;
          line-height: 1.3;
          margin: clamp(2rem, 4vw, 2.75rem) 0 0;
          animation: fadeUp 1s ease both .95s;
        }
        .hero-amp {
          font-family: 'Allura', 'Great Vibes', cursive;
          font-weight: 400;
          font-size: 1.25em;
          color: #7C1B2B;
          letter-spacing: 0;
          display: inline-block;
          margin: 0 .25em;
          vertical-align: -.05em;
        }

        .hero-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(.62rem, 1.1vw, .72rem);
          letter-spacing: .38em;
          text-transform: uppercase;
          color: #7A5555;
          margin-bottom: clamp(1.5rem, 3vw, 2rem);
          animation: fadeIn 1s ease both 0s;
        }
        .hero-place {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(.62rem, 1.1vw, .72rem);
          letter-spacing: .35em;
          text-transform: uppercase;
          color: #7A5555;
          margin-top: clamp(1.5rem, 3vw, 2rem);
          animation: fadeIn 1s ease both 1.25s;
        }

        .hero-guest {
          display: flex; align-items: baseline; gap: .5rem;
          max-width: min(90%, 460px);
          margin: clamp(1.5rem, 3vw, 2rem) auto 0;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: clamp(.85rem, 1.5vw, 1rem);
          color: #5C3535;
          letter-spacing: .04em;
          animation: fadeIn 1s ease both 1.45s;
        }
        .hero-guest-label { white-space: nowrap; }
        .hero-guest-name {
          flex: 1;
          border-bottom: 1px dotted #B89B7E;
          padding: 0 .25em .15em;
          font-style: normal;
          font-weight: 500;
          color: #7C1B2B;
          text-align: center;
          min-height: 1.5em;
        }

        .scroll-cue {
          position: absolute; bottom: clamp(1.5rem, 3vw, 2.5rem);
          left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 2;
          animation: fadeIn 1s ease both 1.8s;
        }
        .scroll-cue span {
          font-family: 'Montserrat', sans-serif;
          font-size: .6rem; letter-spacing: .3em;
          text-transform: uppercase; color: #7A5555;
        }
        .scroll-tick {
          width: 1px; height: 44px;
          background: linear-gradient(to bottom, #C9A96E, transparent);
          animation: tickPulse 2s ease-in-out infinite;
        }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tickPulse { 0%, 100% { opacity: .4 } 50% { opacity: 1 } }

        /* MOBILE — match desktop composition, just scaled down */
        @media (max-width: 560px) {
          .hero-watermark {
            font-size: clamp(180px, 60vw, 260px);
            opacity: .025;
          }
          .save-bg {
            /* same diagonal "behind the date" look as desktop, scaled */
            transform: translate(-50%, 70%) rotate(-5deg);
            font-size: clamp(2rem, 10vw, 3.2rem);
            opacity: .85;
          }
          .hero-date { font-size: clamp(2.8rem, 14vw, 4.4rem); }
          .hero-names { letter-spacing: .1em; font-size: clamp(1.1rem, 5.2vw, 1.6rem); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-date, .hero-rule, .hero-names, .hero-eyebrow, .hero-place, .scroll-cue {
            animation: none !important;
          }
        }
      `}</style>

      <section className="hero">
        <div className="hero-watermark" aria-hidden="true">
          囍
        </div>

        <div className="hero-inner">
          <span className="hero-eyebrow">Trân trọng kính mời</span>

          <div className="date-stack">
            <span className="save-bg" aria-hidden="true">
              Save the Date
            </span>
            <h1 className="hero-date">
              {dd}.{mm}.{yyyy}
            </h1>
          </div>

          <div className="hero-rule" />

          <p className="hero-names">
            {groom}
            <span className="hero-amp">&amp;</span>
            {bride}
          </p>

          <span className="hero-place">
            {config?.venue_name ?? "Lễ Thành Hôn"}
          </span>

          <p className="hero-guest">
            <span className="hero-guest-label">Trân trọng kính mời:</span>
            <span className="hero-guest-name">{guestName || "\u00A0"}</span>
          </p>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>Khám phá</span>
          <div className="scroll-tick" />
        </div>
      </section>
    </>
  );
}
