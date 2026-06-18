import Script from 'next/script'

export const metadata = {
  title: 'ARD Developers — Lead Form',
  robots: { index: false, follow: false },
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --teal:#1A6B5E;--teal-l:#22897A;--teal-xl:#2BA090;
  --gold:#C9A84C;--gold-l:#E8C97A;
  --dark:#050E0C;--dark2:#0A1714;
  --text:#F0F5F4;--muted:rgba(240,245,244,0.62);--border:rgba(26,107,94,0.22);
}
html,body{background:transparent;color:var(--text);font-family:'DM Sans',sans-serif}
body{padding:16px;display:flex;justify-content:center}
.form-card{background:rgba(13,22,20,.92);border:1px solid var(--border);border-radius:18px;padding:24px;width:100%;max-width:460px;backdrop-filter:blur(22px);box-shadow:0 0 40px rgba(26,107,94,.08),inset 0 1px 0 rgba(255,255,255,.04)}
.form-card-header{margin-bottom:18px}
.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
.form-card-header h2{font-family:'Bebas Neue';font-size:clamp(22px,3vw,30px);line-height:1;margin-bottom:6px}
.form-card-header h2 span{color:var(--gold)}
.form-card-header p{font-size:12px;color:var(--muted);line-height:1.5}
.f-label{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.f-input{width:100%;padding:12px 16px;background:rgba(255,255,255,.04);border:1px solid rgba(26,107,94,.26);border-radius:9px;color:var(--text);font-size:14px;font-family:'DM Sans';outline:none;transition:border-color .2s;margin-bottom:16px}
.f-input::placeholder{color:rgba(240,245,244,.3)}
.f-input:focus{border-color:var(--teal-l);background:rgba(26,107,94,.06)}
.f-input.err{border-color:#E24B4A}
.d-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.d-opt{border:1px solid var(--border);border-radius:9px;padding:12px 14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);background:transparent;font-family:'DM Sans';width:100%}
.d-opt svg{width:16px;height:16px;flex-shrink:0}
.d-opt.active{border-color:var(--gold);background:rgba(201,168,76,.08);color:var(--gold-l)}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:20px}
.chip{font-size:12px;padding:6px 12px;border-radius:20px;border:1px solid var(--border);color:var(--muted);cursor:pointer;transition:all .2s;background:transparent;font-family:'DM Sans'}
.chip.active{border-color:var(--teal-l);color:var(--text);background:rgba(26,107,94,.18)}
.sub-btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--teal),var(--teal-xl));border:none;border-radius:10px;color:white;font-size:15px;font-weight:600;cursor:pointer;font-family:'DM Sans';transition:all .25s}
.sub-btn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(26,107,94,.4)}
.sub-btn:disabled{opacity:.65;cursor:wait}
.f-note{text-align:center;font-size:11px;color:var(--muted);margin-top:12px}
.success-view{display:none;text-align:center;padding:8px 0}
.s-icon{width:54px;height:54px;border-radius:50%;background:rgba(26,107,94,.2);border:2px solid var(--teal-l);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;color:var(--teal-l)}
.success-view h3{font-family:'Bebas Neue';font-size:26px;margin-bottom:6px;letter-spacing:.02em}
.success-view p{color:var(--muted);font-size:13px;line-height:1.5;margin-bottom:14px}
.dl-btn{width:100%;padding:12px;background:linear-gradient(135deg,var(--teal),var(--teal-xl));border:none;border-radius:10px;color:white;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'DM Sans'}
.s-box{background:rgba(26,107,94,.1);border:1px solid rgba(26,107,94,.3);border-radius:10px;padding:14px;margin-top:14px;text-align:center}
.s-box strong{color:var(--gold-l)}
.embed-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:rgba(13,22,20,.95);border:1px solid var(--border);border-radius:10px;padding:10px 16px;font-size:13px;color:var(--text);opacity:0;pointer-events:none;transition:opacity .2s;z-index:10}
.embed-toast.show{opacity:1}
.embed-toast.error{border-color:rgba(226,75,74,.55)}
.embed-toast.success{border-color:rgba(34,137,122,.55)}
`

export default function EmbedPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="form-card" id="ard-embed-root">
        <div className="form-card-header">
          <p className="eyebrow">Exclusive Event Offer</p>
          <h2>Get Brochure &amp; <span>Enter Lucky Draw</span></h2>
          <p>Fill in your details to receive the brochure instantly and be entered into today's draw.</p>
        </div>

        <div id="lead-form">
          <label className="f-label" htmlFor="lf-name">Full Name *</label>
          <input className="f-input" id="lf-name" type="text" placeholder="Muhammad Ali" autoComplete="name" />

          <label className="f-label" htmlFor="lf-phone">WhatsApp / Phone *</label>
          <input className="f-input" id="lf-phone" type="tel" placeholder="+92 300 0000000" autoComplete="tel" />

          <label className="f-label" htmlFor="lf-email">Email</label>
          <input className="f-input" id="lf-email" type="email" placeholder="you@example.com" autoComplete="email" />

          <label className="f-label">Send Brochure Via *</label>
          <div className="d-row">
            <button type="button" className="d-opt" id="d-wa" data-delivery="wa">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              WhatsApp
            </button>
            <button type="button" className="d-opt active" id="d-em" data-delivery="em">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              Email
            </button>
          </div>

          <label className="f-label">Interested In</label>
          <div className="chips" id="lf-chips">
            <button type="button" className="chip active">Residential Plots</button>
            <button type="button" className="chip">Commercial Units</button>
            <button type="button" className="chip">Apartments</button>
            <button type="button" className="chip">Investment</button>
            <button type="button" className="chip">Installment Plan</button>
            <button type="button" className="chip">Overseas Pricing</button>
          </div>

          <button type="button" className="sub-btn" id="lf-submit">Get Brochure &amp; Enter Draw →</button>
          <p className="f-note">🎲 Auto-entered into today's Lucky Draw · 🔒 Private</p>
        </div>

        <div className="success-view" id="success-view">
          <div className="s-icon">✓</div>
          <h3>You're In the Draw!</h3>
          <p>Your brochure is downloading now. If it doesn't start, tap the button below.</p>
          <button type="button" className="dl-btn" id="pdf-download-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download Brochure PDF
          </button>
          <div className="s-box">
            <p style={{ fontSize: 11, marginBottom: 4 }}>You're entered as</p>
            <p style={{ fontSize: 14 }}><strong id="success-entry-num">—</strong></p>
          </div>
        </div>
      </div>
      <div className="embed-toast" id="embed-toast" role="status" aria-live="polite" />

      <Script src="/ard-embed.js" strategy="afterInteractive" />
    </>
  )
}
