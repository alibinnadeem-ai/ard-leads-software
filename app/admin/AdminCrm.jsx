'use client'

import { useCallback, useEffect, useState } from 'react'

const TOKEN_KEY = 'ard_admin_token'
const PAGE_SIZES = [25, 50, 100, 200]

const styles = `
*,*::before,*::after{box-sizing:border-box}
.ac-root{min-height:100vh;background:#f4f6f6;color:#1a1a1a;font-family:'DM Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.ac-root,.ac-input,.ac-btn,.ac-select{font-family:inherit}

/* lock screen */
.ac-lock{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#004E59}
.ac-lock-card{width:100%;max-width:360px;background:#fff;border-radius:14px;padding:32px 28px;box-shadow:0 18px 50px rgba(0,0,0,.25)}
.ac-lock-icon{width:48px;height:48px;border-radius:12px;background:#e6f0ee;color:#004E59;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px}
.ac-lock h1{font-size:20px;font-weight:700;text-align:center;margin:0 0 4px}
.ac-lock p{font-size:13px;color:#6b6b6b;text-align:center;margin:0 0 22px}
.ac-input{width:100%;padding:12px 14px;border:1px solid #d4d4d4;border-radius:8px;font-size:14px;outline:none;transition:border-color .15s}
.ac-input:focus{border-color:#004E59}
.ac-err{color:#c0392b;font-size:13px;margin:10px 0 0;min-height:18px}
.ac-btn{cursor:pointer;border:none;border-radius:8px;font-size:14px;font-weight:600;padding:11px 18px;transition:background .15s,opacity .15s}
.ac-btn-primary{background:#004E59;color:#fff;width:100%;margin-top:14px}
.ac-btn-primary:hover{background:#003a42}
.ac-btn:disabled{opacity:.6;cursor:wait}

/* shell */
.ac-header{background:#004E59;color:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.ac-header h1{font-size:18px;font-weight:700;margin:0;letter-spacing:.02em}
.ac-header .ac-sub{font-size:12px;color:rgba(255,255,255,.7);margin-top:2px}
.ac-header-actions{display:flex;gap:10px}
.ac-btn-ghost{background:rgba(255,255,255,.12);color:#fff}
.ac-btn-ghost:hover{background:rgba(255,255,255,.22)}
.ac-main{padding:20px 24px 48px;max-width:1500px;margin:0 auto}

/* stats */
.ac-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px}
.ac-stat{background:#fff;border:1px solid #e6e6e6;border-radius:10px;padding:14px 16px}
.ac-stat .n{font-size:24px;font-weight:700;color:#004E59;line-height:1.1}
.ac-stat .l{font-size:12px;color:#6b6b6b;margin-top:4px;text-transform:uppercase;letter-spacing:.06em}

/* toolbar */
.ac-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.ac-search{flex:1;min-width:240px;max-width:480px;position:relative}
.ac-search .ac-input{padding-left:38px}
.ac-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9a9a9a}
.ac-count{font-size:13px;color:#6b6b6b;margin-left:auto}

/* table */
.ac-table-wrap{background:#fff;border:1px solid #e6e6e6;border-radius:10px;overflow:auto;max-height:calc(100vh - 320px)}
table.ac-table{border-collapse:collapse;width:100%;font-size:13px;white-space:nowrap}
.ac-table thead th{position:sticky;top:0;background:#eef2f1;color:#33514c;text-align:left;font-weight:600;font-size:11px;letter-spacing:.05em;text-transform:uppercase;padding:11px 12px;border-bottom:1px solid #dde3e2;z-index:1}
.ac-table tbody td{padding:10px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top}
.ac-table tbody tr:hover{background:#f7faf9}
.ac-table tbody tr:last-child td{border-bottom:none}
.ac-strong{font-weight:600}
.ac-muted{color:#9a9a9a}
.ac-badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
.ac-badge-sent{background:#e3f3ec;color:#1a7d52}
.ac-badge-no{background:#f0f0f0;color:#8a8a8a}
.ac-badge-win{background:#fdf3da;color:#a07a14}
.ac-badge-wa{background:#e3f3ec;color:#1a7d52}
.ac-badge-em{background:#e7eef5;color:#2c5d8a}

/* footer */
.ac-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;flex-wrap:wrap}
.ac-pager{display:flex;align-items:center;gap:8px}
.ac-btn-pg{background:#fff;border:1px solid #d4d4d4;color:#1a1a1a;padding:8px 14px}
.ac-btn-pg:hover:not(:disabled){border-color:#004E59;color:#004E59}
.ac-select{padding:8px 10px;border:1px solid #d4d4d4;border-radius:8px;font-size:13px;background:#fff;cursor:pointer}
.ac-state{padding:40px;text-align:center;color:#6b6b6b;font-size:14px}
`

function authHeaders() {
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_KEY) : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleString('en-PK', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function filenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (encoded?.[1]) return decodeURIComponent(encoded[1])
  const plain = disposition.match(/filename="?([^"]+)"?/i)
  return plain?.[1] || fallback
}

export default function AdminCrm() {
  const [authed, setAuthed] = useState(false)
  const [booting, setBooting] = useState(true)

  // login
  const [pin, setPin] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // data
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // query
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(50)

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_KEY)
    setAuthed(false)
    setLeads([])
    setStats(null)
    setTotal(0)
    setPin('')
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: authHeaders() })
      if (!res.ok) return
      const body = await res.json()
      if (body?.success) setStats(body.data.overview)
    } catch {
      /* non-critical */
    }
  }, [])

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
      if (debouncedQ) params.set('q', debouncedQ)
      const res = await fetch(`/api/admin/leads?${params.toString()}`, { headers: authHeaders() })
      if (res.status === 401 || res.status === 403) {
        logout()
        return
      }
      const body = await res.json()
      if (!res.ok || !body?.success) throw new Error(body?.error || 'Failed to load records')
      setLeads(body.data)
      setTotal(body.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, offset, limit, logout])

  // restore session on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(TOKEN_KEY)) {
      setAuthed(true)
    }
    setBooting(false)
  }, [])

  // debounce search -> reset to first page
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q)
      setOffset(0)
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  // load whenever authed/query/page changes
  useEffect(() => {
    if (!authed) return
    loadLeads()
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, debouncedQ, offset, limit])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginErr('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const body = await res.json()
      if (!res.ok || !body?.success) throw new Error(body?.error || 'Incorrect password')
      window.sessionStorage.setItem(TOKEN_KEY, body.token)
      setAuthed(true)
    } catch (err) {
      setLoginErr(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  async function exportExcel() {
    try {
      const params = new URLSearchParams({ format: 'xls' })
      if (debouncedQ) params.set('q', debouncedQ)
      const res = await fetch(`/api/admin/leads?${params.toString()}`, { headers: authHeaders() })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) logout()
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filenameFromDisposition(
        res.headers.get('content-disposition'),
        `ARD_Entries_All_${new Date().toISOString().slice(0, 10)}.xls`
      )
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    }
  }

  if (booting) return <style dangerouslySetInnerHTML={{ __html: styles }} />

  if (!authed) {
    return (
      <div className="ac-root">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="ac-lock">
          <form className="ac-lock-card" onSubmit={handleLogin}>
            <div className="ac-lock-icon">🔒</div>
            <h1>Admin CRM</h1>
            <p>Enter the admin password to view lead records.</p>
            <input
              className="ac-input"
              type="password"
              placeholder="Password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            <div className="ac-err">{loginErr}</div>
            <button className="ac-btn ac-btn-primary" type="submit" disabled={loginLoading || pin.length < 4}>
              {loginLoading ? 'Unlocking…' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + limit, total)

  return (
    <div className="ac-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <header className="ac-header">
        <div>
          <h1>ARD Leads · Admin CRM</h1>
          <div className="ac-sub">All lead records from the database</div>
        </div>
        <div className="ac-header-actions">
          <button className="ac-btn ac-btn-ghost" onClick={exportExcel}>Export Excel</button>
          <button className="ac-btn ac-btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="ac-main">
        {stats && (
          <div className="ac-stats">
            <div className="ac-stat"><div className="n">{stats.totalLeads}</div><div className="l">Total Leads</div></div>
            <div className="ac-stat"><div className="n">{stats.todayLeads}</div><div className="l">Leads Today</div></div>
            <div className="ac-stat"><div className="n">{stats.totalEntries}</div><div className="l">Raffle Entries</div></div>
            <div className="ac-stat"><div className="n">{stats.todayEntries}</div><div className="l">Entries Today</div></div>
          </div>
        )}

        <div className="ac-toolbar">
          <div className="ac-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="ac-input"
              type="text"
              placeholder="Search name, phone, email, city, NPI, source…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button className="ac-btn ac-btn-pg" onClick={loadLeads} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <div className="ac-count">{total} record{total === 1 ? '' : 's'}</div>
        </div>

        <div className="ac-table-wrap">
          <table className="ac-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>NPI</th><th>Speciality</th>
                <th>City</th><th>State</th><th>Interest</th><th>Via</th><th>Email</th><th>Draw</th>
                <th>Source</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {!loading && leads.map((lead) => {
                const entry = lead.raffleEntry
                return (
                  <tr key={lead.id}>
                    <td className="ac-strong">{entry?.entryNum ? `#${entry.entryNum}` : <span className="ac-muted">—</span>}</td>
                    <td className="ac-strong">{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.email || <span className="ac-muted">—</span>}</td>
                    <td>{lead.npi || <span className="ac-muted">—</span>}</td>
                    <td>{lead.speciality || <span className="ac-muted">—</span>}</td>
                    <td>{lead.city || <span className="ac-muted">—</span>}</td>
                    <td>{lead.state || <span className="ac-muted">—</span>}</td>
                    <td>{lead.interest || <span className="ac-muted">—</span>}</td>
                    <td>
                      <span className={`ac-badge ${lead.delivery === 'wa' ? 'ac-badge-wa' : 'ac-badge-em'}`}>
                        {lead.delivery === 'wa' ? 'WhatsApp' : 'Email'}
                      </span>
                    </td>
                    <td>
                      <span className={`ac-badge ${lead.emailSent ? 'ac-badge-sent' : 'ac-badge-no'}`}>
                        {lead.emailSent ? 'Sent' : '—'}
                      </span>
                    </td>
                    <td>
                      {entry?.isWinner
                        ? <span className="ac-badge ac-badge-win">🏆 Place {entry.place}</span>
                        : <span className="ac-muted">—</span>}
                    </td>
                    <td>{lead.source}</td>
                    <td>{fmtDate(lead.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {loading && <div className="ac-state">Loading records…</div>}
          {!loading && error && <div className="ac-state" style={{ color: '#c0392b' }}>{error}</div>}
          {!loading && !error && leads.length === 0 && <div className="ac-state">No records found.</div>}
        </div>

        <div className="ac-foot">
          <div className="ac-count">{total === 0 ? 'No records' : `Showing ${from}–${to} of ${total}`}</div>
          <div className="ac-pager">
            <label className="ac-count" htmlFor="ac-size">Rows:</label>
            <select
              id="ac-size"
              className="ac-select"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0) }}
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              className="ac-btn ac-btn-pg"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0 || loading}
            >
              ‹ Prev
            </button>
            <button
              className="ac-btn ac-btn-pg"
              onClick={() => setOffset(offset + limit)}
              disabled={to >= total || loading}
            >
              Next ›
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
