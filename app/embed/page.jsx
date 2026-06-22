import Script from 'next/script'

export const metadata = {
  title: 'ARD Developers — Lead Form',
  robots: { index: false, follow: false },
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --green:#004E59;
  --green-hover:#003a42;
  --green-soft:rgba(0,78,89,.06);
  --text:#1a1a1a;
  --muted:#6b6b6b;
  --border:#d4d4d4;
  --required:#e74c3c;
}
html,body{background:#fff;color:var(--text);font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
body{padding:24px;display:flex;justify-content:center}
.form-card{width:100%;max-width:560px}
.form-card-header{margin-bottom:22px}
.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--green);font-weight:600;margin-bottom:6px}
.form-card-header h2{font-size:22px;font-weight:600;color:var(--text);margin-bottom:6px;line-height:1.2}
.form-card-header h2 span{color:var(--green)}
.form-card-header p{font-size:13px;color:var(--muted);line-height:1.5}
.f-group{margin-bottom:18px}
.f-label{display:block;font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px}
.f-label .req{color:var(--required);margin-left:3px}
.f-input{width:100%;padding:12px 14px;background:#fff;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .15s}
.f-input::placeholder{color:#a1a1a1}
.f-input:focus{border-color:var(--green)}
.f-input.err{border-color:var(--required)}
.d-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.d-opt{border:1px solid var(--border);border-radius:6px;padding:11px 14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:500;color:var(--muted);background:#fff;font-family:'DM Sans',sans-serif;transition:all .15s}
.d-opt svg{width:15px;height:15px;flex-shrink:0}
.d-opt:hover:not(:disabled){border-color:var(--green);color:var(--green)}
.d-opt.active{border-color:var(--green);color:var(--green);background:var(--green-soft)}
.d-opt:disabled{opacity:.5;cursor:not-allowed}
.checkboxes{display:flex;flex-wrap:wrap;gap:12px 22px;margin-top:4px}
.checkbox{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;color:var(--text);user-select:none;line-height:1}
.checkbox input{appearance:none;-webkit-appearance:none;width:17px;height:17px;border:1.5px solid #9a9a9a;border-radius:3px;background:#fff;cursor:pointer;position:relative;flex-shrink:0;margin:0;transition:all .15s}
.checkbox input:hover{border-color:var(--green)}
.checkbox input:checked{background:var(--green);border-color:var(--green)}
.checkbox input:checked::after{content:'';position:absolute;left:4px;top:0;width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
.checkbox input:focus-visible{outline:2px solid var(--green);outline-offset:2px}
.sub-btn{margin-top:6px;padding:11px 26px;background:var(--green);border:none;border-radius:6px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .15s}
.sub-btn:hover{background:var(--green-hover)}
.sub-btn:disabled{opacity:.6;cursor:wait}
.f-note{font-size:12px;color:var(--muted);margin-top:10px}
.success-view{display:none;padding:8px 0}
.s-icon{width:44px;height:44px;border-radius:50%;background:var(--green-soft);display:flex;align-items:center;justify-content:center;margin-bottom:14px;color:var(--green);font-size:22px;font-weight:600}
.success-view h3{font-size:20px;font-weight:600;margin-bottom:6px;color:var(--text)}
.success-view p{color:var(--muted);font-size:14px;line-height:1.5;margin-bottom:18px}
.dl-btn{padding:11px 22px;background:var(--green);border:none;border-radius:6px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif}
.dl-btn:hover{background:var(--green-hover)}
.s-box{background:#f7f7f7;border:1px solid #ececec;border-radius:6px;padding:12px 14px;margin-top:16px;font-size:13px;color:var(--muted)}
.s-box strong{color:var(--text);font-weight:600}
.s-thanks{color:var(--green);font-weight:600;font-size:13px;margin-bottom:6px}
.embed-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#1a1a1a;color:#fff;border-radius:6px;padding:10px 16px;font-size:13px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.embed-toast.show{opacity:1}
.embed-toast.error{background:#c0392b}
.embed-toast.success{background:var(--green)}
`

export default function EmbedPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="form-card" id="ard-embed-root">
        <div className="form-card-header">
          <p className="eyebrow">Exclusive Event Offer</p>
          <h2>Get Brochure &amp; <span>Enter Lucky Draw</span></h2>
          <p>Fill in your details to receive the brochure instantly and be entered into today&apos;s draw.</p>
        </div>

        <div id="lead-form">
          <div className="f-group">
            <label className="f-label" htmlFor="lf-name">Full Name<span className="req">*</span></label>
            <input className="f-input" id="lf-name" type="text" placeholder="Muhammad Ali" autoComplete="name" />
          </div>

          <div className="f-group">
            <label className="f-label" htmlFor="lf-phone">WhatsApp / Phone<span className="req">*</span></label>
            <input className="f-input" id="lf-phone" type="tel" placeholder="+92 300 0000000" autoComplete="tel" />
          </div>

          <div className="f-group">
            <label className="f-label" htmlFor="lf-email">Email</label>
            <input className="f-input" id="lf-email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>

          <div className="f-group">
            <label className="f-label">Send Brochure Via<span className="req">*</span></label>
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
          </div>

          <div className="f-group">
            <label className="f-label">Interested In<span className="req">*</span></label>
            <div className="checkboxes" id="lf-chips">
              <label className="checkbox">
                <input type="checkbox" data-project="ard-marina" />
                <span>ARD Marina</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" data-project="qantara-rivarch" />
                <span>Qantara Rivarch</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" data-project="qantara-commercial" />
                <span>Qantara Commercial</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" data-project="the-boulevard" />
                <span>The Boulevard</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" data-project="green-zone-living" />
                <span>Green Zone Living</span>
              </label>
            </div>
          </div>

          <button type="button" className="sub-btn" id="lf-submit">Submit Form to Enter Draw</button>
          <p className="f-note">Auto-entered into today&apos;s Lucky Draw</p>
        </div>

        <div className="success-view" id="success-view">
          <div className="s-icon">✓</div>
          <h3>You&apos;re In the Draw!</h3>
          <p>Your brochures are downloading now as a ZIP. If it doesn&apos;t start, tap the button below.</p>
          <button type="button" className="dl-btn" id="pdf-download-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download Brochures
          </button>
          <div className="s-box">
            <div className="s-thanks">Thank you! Your form is submitted successfully</div>
            You&apos;re entered as <strong id="success-entry-num">—</strong>
          </div>
        </div>
      </div>
      <div className="embed-toast" id="embed-toast" role="status" aria-live="polite" />

      <Script src="/ard-embed.js" strategy="afterInteractive" />
    </>
  )
}
