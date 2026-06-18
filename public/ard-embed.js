(() => {
  const $ = (id) => document.getElementById(id)
  const whatsappEnabled = false
  let delivery = whatsappEnabled ? 'wa' : 'em'
  let activeLead = null

  function toast(message, type = '') {
    const el = $('embed-toast')
    if (!el) return
    el.textContent = message
    el.className = `embed-toast ${type} show`
    setTimeout(() => el.classList.remove('show'), 2600)
  }

  function setDelivery(mode) {
    if (mode === 'wa' && !whatsappEnabled) {
      toast('WhatsApp delivery is not available yet', 'error')
      return
    }
    delivery = mode
    $('d-wa')?.classList.toggle('active', mode === 'wa')
    $('d-em')?.classList.toggle('active', mode === 'em')
  }

  async function submitLead() {
    const name = $('lf-name')?.value.trim() || ''
    const phone = $('lf-phone')?.value.trim() || ''
    const email = $('lf-email')?.value.trim() || ''
    ;['lf-name', 'lf-phone', 'lf-email'].forEach((id) => $(id)?.classList.remove('err'))

    let ok = true
    if (!name) { $('lf-name')?.classList.add('err'); ok = false }
    if (!phone) { $('lf-phone')?.classList.add('err'); ok = false }
    if (delivery === 'em' && !email) {
      $('lf-email')?.classList.add('err')
      toast('Email is required for brochure delivery', 'error')
      ok = false
    }
    if (!ok) return

    const interest = [...document.querySelectorAll('#lf-chips .chip.active')]
      .map((chip) => chip.textContent.trim())
      .join(', ')

    const referrer = (() => {
      try { return document.referrer || '' } catch { return '' }
    })()

    const payload = {
      name, phone, email,
      delivery, interest,
      source: referrer ? `Embed: ${referrer}` : 'Embed Form',
      event: 'ARD Developers Event 2025',
    }

    const button = $('lf-submit')
    const originalLabel = button?.innerHTML
    if (button) {
      button.disabled = true
      button.textContent = 'Processing...'
    }

    try {
      const apiUrl = new URL('/api/leads', window.location.origin).toString()
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        const message = data.error || (Array.isArray(data.errors) && data.errors[0]?.msg) || 'Failed to save lead'
        throw new Error(message)
      }

      activeLead = {
        leadId: data.data.leadId,
        entryNumber: data.data.entryNumber,
        name,
      }

      $('lead-form').style.display = 'none'
      $('success-view').style.display = 'block'
      const entryEl = $('success-entry-num')
      if (entryEl) entryEl.textContent = `Entry #${data.data.entryNumber} · ${new Date().toLocaleDateString()}`

      toast(`${name} entered the Lucky Draw 🎲`, 'success')
      postSize()

      notifyParent('ard:lead-success', {
        leadId: data.data.leadId,
        entryNumber: data.data.entryNumber,
      })
    } catch (err) {
      toast(err.message || 'Failed to save lead', 'error')
      notifyParent('ard:lead-error', { message: err.message })
    } finally {
      if (button) {
        button.disabled = false
        button.innerHTML = originalLabel || 'Get Brochure & Enter Draw →'
      }
    }
  }

  function downloadPDF() {
    if (!activeLead?.leadId) {
      toast('Please submit the form first', 'error')
      return
    }
    const url = new URL(`/api/leads/${activeLead.leadId}/pdf`, window.location.origin).toString()
    const link = document.createElement('a')
    link.href = url
    link.download = `ARD_Developers_Brochure_${String(activeLead.name || 'Lead').replace(/\s+/g, '_')}.pdf`
    link.target = '_blank'
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  function notifyParent(type, payload) {
    if (window.parent === window) return
    try {
      window.parent.postMessage({ type, payload }, '*')
    } catch {}
  }

  let lastHeight = 0
  function postSize() {
    if (window.parent === window) return
    const root = document.documentElement
    const height = Math.max(
      document.body.scrollHeight,
      root.scrollHeight,
      document.body.offsetHeight,
      root.offsetHeight,
    )
    if (height === lastHeight) return
    lastHeight = height
    try {
      window.parent.postMessage({ type: 'ard:resize', height }, '*')
    } catch {}
  }

  function init() {
    $('d-wa')?.addEventListener('click', () => setDelivery('wa'))
    $('d-em')?.addEventListener('click', () => setDelivery('em'))
    $('lf-submit')?.addEventListener('click', submitLead)
    $('pdf-download-btn')?.addEventListener('click', downloadPDF)

    document.querySelectorAll('#lf-chips .chip').forEach((chip) => {
      chip.addEventListener('click', () => chip.classList.toggle('active'))
    })

    setDelivery(delivery)

    postSize()
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(postSize).observe(document.body)
    }
    window.addEventListener('load', postSize)
    window.addEventListener('resize', postSize)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
