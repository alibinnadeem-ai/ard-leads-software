(() => {
  const $ = (id) => document.getElementById(id)
  const adminTokenKey = 'ard_admin_token'

  const MED = { 1: '🥇', 2: '🥈', 3: '🥉' }
  const PLN = { 1: 'FIRST PLACE', 2: 'SECOND PLACE', 3: 'THIRD PLACE' }
  const PLC = { 1: 'var(--s1)', 2: 'var(--s2)', 3: 'var(--s3)' }
  const WCL = { 1: 'w1', 2: 'w2', 3: 'w3' }
  const BCL = { 1: 'b1', 2: 'b2', 3: 'b3' }
  const CC = ['#C9A84C', '#22897A', '#FFD700', '#F0F5F4', '#E8C97A', '#2BA090', '#fff']

  let entries = []
  let drawStep = 0
  let isDrawing = false
  let adminOK = false
  const whatsappEnabled = false
  let dMode = whatsappEnabled ? 'wa' : 'em'
  let activeLead = null
  let spinIv = null
  let adminToken = null

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {})
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

    const response = await fetch(path, { ...options, headers })
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await response.json() : await response.text()

    if (!response.ok) {
      const message = typeof data === 'object' ? data.error || data.message : data
      const err = new Error(message || `Request failed: ${response.status}`)
      err.status = response.status
      err.data = data
      throw err
    }

    return data
  }

  function authHeaders() {
    const token = adminToken || safeSessionGet(adminTokenKey)
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {}
  }

  function safeSessionRemove(key) {
    try {
      window.sessionStorage.removeItem(key)
    } catch {}
  }

  function setText(id, value) {
    const el = $(id)
    if (el) el.textContent = value
  }

  function setDisplay(id, value) {
    const el = $(id)
    if (el) el.style.display = value
  }

  function winners() {
    return entries.filter((entry) => entry.isWinner)
  }

  function eligibleEntries() {
    return entries.filter((entry) => !entry.isWinner)
  }

  function prizeForPlace(place) {
    const input = $(`g${place}`)
    if (input?.value) return input.value
    return place === 1 ? 'ARD Developers Gift Hamper' : place === 2 ? 'ARD City Merchandise Set' : 'ARD Branded Accessory'
  }

  function initials(name) {
    return String(name || '')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  window.switchView = function switchView(view) {
    document.querySelectorAll('.view').forEach((element) => element.classList.remove('active'))
    document.querySelectorAll('.nav-tab').forEach((element) => element.classList.remove('active'))
    $(`view-${view}`)?.classList.add('active')
    $(`tab-${view}`)?.classList.add('active')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  window.setD = function setD(mode) {
    if (mode === 'wa' && !whatsappEnabled) {
      toast('WhatsApp delivery is not available yet', 'error')
      return
    }

    dMode = mode
    $('d-wa')?.classList.toggle('active', mode === 'wa')
    $('d-em')?.classList.toggle('active', mode === 'em')
  }

  window.tc = function tc(element) {
    element.classList.toggle('active')
  }

  window.submitLead = async function submitLead() {
    const name = $('lf-name')?.value.trim() || ''
    const phone = $('lf-phone')?.value.trim() || ''
    const email = $('lf-email')?.value.trim() || ''
    const npi = $('lf-npi')?.value.trim() || ''
    const speciality = $('lf-speciality')?.value.trim() || ''
    const city = $('lf-city')?.value.trim() || ''
    const state = $('lf-state')?.value.trim() || ''
    ;['lf-name', 'lf-phone', 'lf-email', 'lf-npi', 'lf-speciality', 'lf-city', 'lf-state'].forEach((id) => $(id)?.classList.remove('err'))

    let ok = true
    if (!name) {
      $('lf-name')?.classList.add('err')
      ok = false
    }
    if (!phone) {
      $('lf-phone')?.classList.add('err')
      ok = false
    }
    if (dMode === 'em' && !email) {
      $('lf-email')?.classList.add('err')
      toast('Email is required for brochure delivery', 'error')
      ok = false
    }

    const selectedChips = [...document.querySelectorAll('#lf-chips .chip.active')]
    if (selectedChips.length === 0) {
      toast('Please select at least one project', 'error')
      ok = false
    }
    if (!ok) return

    const interest = selectedChips.map((chip) => chip.textContent.trim()).join(', ')
    const selectedProjects = selectedChips
      .map((chip) => chip.getAttribute('data-project'))
      .filter(Boolean)
    const lead = {
      name,
      phone,
      email,
      npi,
      speciality,
      city,
      state,
      delivery: dMode,
      interest,
      source: 'Event QR Form',
      event: 'ARD Developers Event 2025',
    }

    const button = document.querySelector('.sub-btn')
    if (button) {
      button.disabled = true
      button.textContent = 'Processing...'
    }

    setIntegrationStatus('sending')

    try {
      const result = await api('/api/leads', {
        method: 'POST',
        body: JSON.stringify(lead),
      })

      activeLead = {
        ...lead,
        leadId: result.data.leadId,
        entryId: result.data.entryId,
        entryNumber: result.data.entryNumber,
        eventDate: result.data.eventDate,
        projects: selectedProjects,
      }

      setDisplay('lead-form', 'none')
      setDisplay('success-view', 'block')
      setIntegrationStatus('done', result.data.integrations)
      toast(`${name} entered the Lucky Draw! 🎲`, 'success')
      await loadPool({ silent: true })

      setTimeout(() => {
        window.downloadPDF()
      }, 600)
    } catch (err) {
      setIntegrationStatus('error')
      toast(err.message || 'Failed to save lead', 'error')
    } finally {
      if (button) {
        button.disabled = false
        button.innerHTML = '<span class="shine"></span>Get Brochure & Enter Draw →'
      }
    }
  }

  window.downloadPDF = function downloadPDF() {
    if (!activeLead?.leadId) {
      toast('Please submit the form first', 'error')
      return
    }

    const safeName = String(activeLead.name || 'Lead').replace(/\s+/g, '_')
    const downloads = [
      {
        href: `/api/leads/${activeLead.leadId}/pdf`,
        filename: `ARD_Developers_Brochure_${safeName}.pdf`,
      },
      ...(activeLead.projects || []).map((project) => ({
        href: `/brochures/${project}.pdf`,
        filename: `ARD_Developers_${project}_${safeName}.pdf`,
      })),
    ]

    downloads.forEach(({ href, filename }, index) => {
      const link = document.createElement('a')
      link.href = href
      link.download = filename
      document.body.appendChild(link)
      setTimeout(() => {
        link.click()
        link.remove()
      }, index * 350)
    })

    toast(
      downloads.length > 1
        ? `Downloading ${downloads.length} PDFs`
        : 'PDF download started',
      'success'
    )
  }

  function setIntegrationStatus(state, integrations) {
    const el = $('integration-status')
    if (!el) return

    if (state === 'sending') {
      el.innerHTML = '<span style="font-size:11px;color:var(--muted)">⟳ Saving lead and syncing CRM...</span>'
      return
    }

    if (state === 'error') {
      el.innerHTML = '<span style="font-size:11px;color:rgba(242,75,74,.8)">Lead could not be saved. Please try again.</span>'
      return
    }

    const labels = [
      ['zapier', 'Webhook'],
      ['clickup', 'ClickUp'],
      ['email', 'Email'],
      ['whatsapp', 'WhatsApp'],
    ]

    const parts = labels.map(([key, label]) => {
      const ok = !integrations || integrations[key] === 'fulfilled'
      return ok
        ? `<span style="color:var(--teal-l)">✓ ${label}</span>`
        : `<span style="color:rgba(242,75,74,.7)">⚠ ${label}</span>`
    })

    el.innerHTML = `<span style="font-size:11px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">${parts.join('')}</span>`
  }

  window.checkPin = async function checkPin() {
    const pinInput = $('pin-input')
    const pin = pinInput?.value || ''

    try {
      const result = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      })

      adminToken = result.token
      safeSessionSet(adminTokenKey, result.token)
      showAdminUi()
      await loadPool({ silent: true })
      toast('Admin access granted', 'success')
    } catch (err) {
      setText('pin-err', err.message || 'Incorrect PIN')
      if (pinInput) pinInput.value = ''
      setTimeout(() => setText('pin-err', ''), 2200)
    }
  }

  function showAdminUi() {
    adminOK = true
    setDisplay('pin-gate', 'none')
    setDisplay('pin-ok', 'block')
    setDisplay('add-entry-sec', 'block')
    setDisplay('prizes-sec', 'block')
    setDisplay('reset-btn', 'block')
    renderEntries()
    updateDrum()
    loadAdminStats()
  }

  function clearAdmin() {
    adminOK = false
    adminToken = null
    safeSessionRemove(adminTokenKey)
    setDisplay('pin-gate', 'block')
    setDisplay('pin-ok', 'none')
    setDisplay('add-entry-sec', 'none')
    setDisplay('prizes-sec', 'none')
    setDisplay('reset-btn', 'none')
    updateDrum()
  }

  window.addEntryManual = async function addEntryManual() {
    if (!adminOK) {
      toast('Unlock admin access first', 'error')
      return
    }

    const name = $('ef-name')?.value.trim() || ''
    const phone = $('ef-phone')?.value.trim() || ''
    const interest = $('ef-interest')?.value.trim() || ''
    const npi = $('ef-npi')?.value.trim() || ''
    const speciality = $('ef-speciality')?.value.trim() || ''
    const city = $('ef-city')?.value.trim() || ''
    const state = $('ef-state')?.value.trim() || ''
    ;['ef-name', 'ef-phone'].forEach((id) => $(id)?.classList.remove('err'))

    let ok = true
    if (!name) {
      $('ef-name')?.classList.add('err')
      ok = false
    }
    if (!phone) {
      $('ef-phone')?.classList.add('err')
      ok = false
    }
    if (!ok) return

    try {
      await api('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phone,
          interest,
          npi,
          speciality,
          city,
          state,
          delivery: 'wa',
          source: 'Manual',
          event: 'ARD Developers Event 2025',
        }),
      })

      if ($('ef-name')) $('ef-name').value = ''
      if ($('ef-phone')) $('ef-phone').value = ''
      if ($('ef-interest')) $('ef-interest').value = ''
      if ($('ef-npi')) $('ef-npi').value = ''
      if ($('ef-speciality')) $('ef-speciality').value = ''
      if ($('ef-city')) $('ef-city').value = ''
      if ($('ef-state')) $('ef-state').value = ''

      await loadPool({ silent: true })
      toast(`${name} added ✓`, 'success')
    } catch (err) {
      toast(err.message || 'Could not add entry', 'error')
    }
  }

  window.openBulk = function openBulk() {
    $('bulk-modal')?.classList.add('open')
  }

  window.closeBulk = function closeBulk() {
    $('bulk-modal')?.classList.remove('open')
  }

  window.importBulk = async function importBulk() {
    if (!adminOK) {
      toast('Unlock admin access first', 'error')
      return
    }

    const raw = $('bulk-text')?.value.trim() || ''
    if (!raw) {
      toast('Nothing to import', 'error')
      return
    }

    let added = 0
    const lines = raw.split('\n').filter((line) => line.trim())

    for (const line of lines) {
      const parts = line.split(',')
      const name = (parts[0] || '').trim()
      const phone = (parts[1] || '').trim()
      const interest = (parts[2] || '').trim()

      if (!name || !phone) continue

      try {
        await api('/api/leads', {
          method: 'POST',
          body: JSON.stringify({
            name,
            phone,
            interest,
            delivery: 'wa',
            source: 'CSV',
            event: 'ARD Developers Event 2025',
          }),
        })
        added++
      } catch (err) {
        console.warn('Bulk entry skipped:', err.message)
      }
    }

    closeBulk()
    if ($('bulk-text')) $('bulk-text').value = ''
    await loadPool({ silent: true })
    toast(`${added} entries imported`, 'success')
  }

  window.removeEntry = async function removeEntry(id) {
    if (!adminOK) {
      toast('Unlock admin access first', 'error')
      return
    }

    const entry = entries.find((item) => item.id === id)
    if (entry?.isWinner) {
      toast('Cannot remove a winner', 'error')
      return
    }

    try {
      await api(`/api/raffle/entries/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      await loadPool({ silent: true })
      toast('Entry removed', 'success')
    } catch (err) {
      if (err.status === 401 || err.status === 403) clearAdmin()
      toast(err.message || 'Could not remove entry', 'error')
    }
  }

  window.startDraw = function startDraw() {
    if (isDrawing || drawStep >= 3) return

    if (!adminOK) {
      toast('Unlock admin access first', 'error')
      return
    }

    const pool = eligibleEntries()
    if (!pool.length) {
      toast('No eligible entries', 'error')
      return
    }

    isDrawing = true
    const button = $('draw-btn')
    if (button) {
      button.disabled = true
      button.textContent = '🎲 DRAWING...'
    }
    setText('drum-state', `Drawing ${MED[drawStep + 1]} ${PLN[drawStep + 1]}...`)
    startTape(pool)

    setTimeout(async () => {
      try {
        await savePrizes()
        const result = await api('/api/raffle/draw', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({}),
        })

        const winner = {
          id: result.data.winner.entryId,
          name: result.data.winner.name,
          phone: result.data.winner.phone,
          interest: result.data.winner.interest,
          place: result.data.place,
          prize: result.data.prize,
          isWinner: true,
        }

        drawStep = result.data.place
        setFinalTape(winner.name)
        await loadPool({ silent: true })
        showConfetti(result.data.place)
        setTimeout(() => showAnnounce(winner, result.data.place, result.data.prize), 350)
        updatePodium()
      } catch (err) {
        if (err.status === 401 || err.status === 403) clearAdmin()
        stopTape()
        toast(err.message || 'Draw failed. Please try again.', 'error')
      } finally {
        isDrawing = false
        if (button) button.textContent = '🎲 START DRAW'
        updateDrum()
      }
    }, 2400 + Math.random() * 800)
  }

  async function savePrizes() {
    if (!adminOK) return

    await api('/api/raffle/prizes', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({
        prize1: $('g1')?.value || undefined,
        prize2: $('g2')?.value || undefined,
        prize3: $('g3')?.value || undefined,
      }),
    })
  }

  window.nextDraw = function nextDraw() {
    $('announce')?.classList.remove('open')
    if (drawStep >= 3) setDisplay('podium-section', 'block')
  }

  window.resetDraw = async function resetDraw() {
    if (!adminOK) {
      toast('Unlock admin access first', 'error')
      return
    }

    if (!confirm('Reset draw? Winner selections cleared. Entries kept.')) return

    try {
      await api('/api/raffle/reset', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({}),
      })
      stopTape()
      setText('tape-inner', '')
      const tapeInner = $('tape-inner')
      if (tapeInner) tapeInner.innerHTML = '<div class="tape-item">— READY —</div>'
      setText('drum-state', 'Form entries appear here automatically')
      setDisplay('podium-section', 'none')
      await loadPool({ silent: true })
      toast('Draw reset. Entries preserved.', 'success')
    } catch (err) {
      if (err.status === 401 || err.status === 403) clearAdmin()
      toast(err.message || 'Reset failed', 'error')
    }
  }

  async function loadPool({ silent = false } = {}) {
    try {
      const result = await api('/api/raffle/pool')
      const data = result.data
      entries = (data.entries || []).map((entry) => ({
        ...entry,
        phone: entry.rawPhone || entry.phone,
      }))
      drawStep = winners().length
      applyPrizes(data.prizes)
      updateAll()
      if (adminOK) {
        await loadAdminStats()
      }
      return data
    } catch (err) {
      if (!silent) console.warn('Pool load failed:', err.message)
      entries = []
      drawStep = 0
      updateAll()
      setText('drum-state', 'Connect Neon and run the database setup to load entries')
      return null
    }
  }

  function applyPrizes(prizes) {
    if (!prizes) return
    if ($('g1')) $('g1').value = prizes.first || $('g1').value
    if ($('g2')) $('g2').value = prizes.second || $('g2').value
    if ($('g3')) $('g3').value = prizes.third || $('g3').value
  }

  function updateAll() {
    renderEntries()
    updateDrum()
    setText('nav-count', entries.length)
    setText('stat-total', entries.length)
    setText('stat-winners', winners().length)
    setText('stat-remaining', eligibleEntries().length)
    updatePodium()
  }

  function renderEntries() {
    const list = $('entries-list')
    setText('e-count-label', `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`)
    if (!list) return

    if (!entries.length) {
      list.innerHTML = '<div class="empty-state">No entries yet.<br>Submit the event form to join.</div>'
      return
    }

    list.innerHTML = entries
      .map((entry) => {
        const winnerClass = entry.isWinner ? WCL[entry.place] || '' : ''
        const badge = entry.isWinner ? `<span class="ei-badge ${BCL[entry.place] || ''}">${MED[entry.place] || ''}</span>` : ''
        const remove = !entry.isWinner && adminOK ? `<button class="ei-del" onclick="removeEntry('${entry.id}')">×</button>` : ''
        const phoneLine = `${escapeHtml(entry.phone)}${entry.interest ? ` · ${escapeHtml(entry.interest)}` : ''}`

        return `<div class="entry-item ${winnerClass}">
          <div class="av">${escapeHtml(initials(entry.name))}</div>
          <div class="ei-info">
            <div class="ei-name">#${entry.entryNum} ${escapeHtml(entry.name)}</div>
            <div class="ei-phone">${phoneLine}</div>
          </div>
          ${badge}
          ${remove}
        </div>`
      })
      .join('')
  }

  function updateDrum() {
    setText('drum-count', entries.length)

    const button = $('draw-btn')
    if (!button) return

    setDisplay('reset-btn', adminOK ? 'block' : 'none')

    if (drawStep >= 3) {
      button.textContent = '✓ All 3 Winners Drawn'
      button.disabled = true
      setText('drum-state', 'Balloting complete!')
      return
    }

    if (!isDrawing) {
      button.textContent = '🎲 START DRAW'
    }

    button.disabled = eligibleEntries().length < 1 || isDrawing || !adminOK

    if (!entries.length) {
      setText('drum-state', 'Form entries appear here automatically')
    } else if (!adminOK) {
      setText('drum-state', 'Unlock admin access to start the draw')
    } else if (!isDrawing) {
      setText('drum-state', 'Ready for secure server-side draw')
    }
  }

  function startTape(pool) {
    clearInterval(spinIv)
    spinIv = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)]
      const tapeInner = $('tape-inner')
      if (tapeInner) tapeInner.innerHTML = `<div class="tape-item">${escapeHtml(random.name)}</div>`
    }, 75)
  }

  function stopTape() {
    clearInterval(spinIv)
    spinIv = null
  }

  function setFinalTape(name) {
    stopTape()
    const tapeInner = $('tape-inner')
    if (tapeInner) tapeInner.innerHTML = `<div class="tape-item" style="color:var(--gold-l)">${escapeHtml(name)}</div>`
  }

  function showAnnounce(entry, place, prize) {
    setText('an-place', `${MED[place]} ${PLN[place]} WINNER`)
    if ($('an-place')) $('an-place').style.color = PLC[place]
    setText('an-medal', MED[place])
    setText('an-name', entry.name)
    setText('an-phone', entry.phone)
    setText('an-prize', prize || prizeForPlace(place))
    if ($('an-prize')) {
      $('an-prize').style.background = `rgba(${place === 1 ? '255,215,0' : place === 2 ? '192,192,192' : '205,127,50'},.15)`
      $('an-prize').style.color = PLC[place]
    }
    setText('an-btn', drawStep < 3 ? `Draw ${MED[drawStep + 1]} ${PLN[drawStep + 1]} →` : 'See Full Podium ✓')
    $('announce')?.classList.add('open')
  }

  function updatePodium() {
    const podium = $('podium')
    if (!podium) return

    const order = [2, 1, 3]
    const currentWinners = winners()

    podium.innerHTML = order
      .map((place) => {
        const winner = currentWinners.find((item) => item.place === place)
        const prize = winner?.prize || prizeForPlace(place)

        if (!winner) {
          return `<div class="pod pod-${place}" style="opacity:.15"><div class="pod-medal">${MED[place]}</div><div class="pod-place" style="color:${PLC[place]}">${PLN[place]}</div><div class="pod-name" style="color:var(--muted)">TBD</div></div>`
        }

        return `<div class="pod pod-${place} vis"><div class="pod-medal">${MED[place]}</div><div class="pod-place" style="color:${PLC[place]}">${PLN[place]}</div><div class="pod-name">${escapeHtml(winner.name)}</div><div class="pod-phone">${escapeHtml(winner.phone)}</div><div class="pod-prize">${escapeHtml(prize)}</div></div>`
      })
      .join('')

    if (currentWinners.length) setDisplay('podium-section', 'block')
  }

  function showConfetti(place) {
    const wrap = $('confetti-wrap')
    if (!wrap) return

    const count = place === 1 ? 90 : place === 2 ? 55 : 38
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div')
      element.className = 'cf'
      element.style.cssText = `left:${Math.random() * 100}%;width:${4 + Math.random() * 9}px;height:${4 + Math.random() * 9}px;background:${CC[Math.floor(Math.random() * CC.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-delay:${Math.random() * 0.8}s;animation-duration:${2.5 + Math.random() * 1.5}s`
      wrap.appendChild(element)
      setTimeout(() => element.remove(), 4500)
    }
  }

  function toast(message, type = '') {
    const el = $('toast')
    if (!el) return

    el.textContent = message
    el.className = `toast ${type} show`
    setTimeout(() => el.classList.remove('show'), 2800)
  }

  window.toast = toast

  function initThreeCity() {
    if (!window.THREE || !$('bg-canvas')) return

    const canvas = $('bg-canvas')
    const renderer = new window.THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x050e0c, 1)

    const scene = new window.THREE.Scene()
    scene.fog = new window.THREE.FogExp2(0x050e0c, 0.026)

    const camera = new window.THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 14, 34)
    camera.lookAt(0, 3, 0)

    scene.add(new window.THREE.AmbientLight(0x0d2e2a, 1.4))
    const dl = new window.THREE.DirectionalLight(0x22897a, 1.8)
    dl.position.set(10, 20, 10)
    scene.add(dl)
    const gl = new window.THREE.PointLight(0xc9a84c, 2.2, 55)
    gl.position.set(-10, 14, -6)
    scene.add(gl)
    const gl2 = new window.THREE.PointLight(0x1a6b5e, 1.5, 42)
    gl2.position.set(12, 10, 8)
    scene.add(gl2)

    const grid = new window.THREE.GridHelper(100, 50, 0x1a6b5e, 0x0d1614)
    grid.material.opacity = 0.3
    grid.material.transparent = true
    scene.add(grid)

    const ground = new window.THREE.Mesh(
      new window.THREE.PlaneGeometry(100, 100),
      new window.THREE.MeshBasicMaterial({ color: 0x050e0c })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.5
    scene.add(ground)

    const colors = [0x0d1e1b, 0x0f2420, 0x112820, 0x0a1a17]
    function building(x, z, width, height, depth) {
      const geo = new window.THREE.BoxGeometry(width, height, depth)
      const mat = new window.THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        emissive: 0x051210,
        specular: 0x1a6b5e,
        shininess: 25,
      })
      const mesh = new window.THREE.Mesh(geo, mat)
      mesh.position.set(x, height / 2 - 0.5, z)
      scene.add(mesh)

      const edges = new window.THREE.EdgesGeometry(geo)
      mesh.add(
        new window.THREE.LineSegments(
          edges,
          new window.THREE.LineBasicMaterial({ color: 0x1a6b5e, opacity: 0.18, transparent: true })
        )
      )

      const cols = Math.max(1, Math.floor(width / 0.85))
      const rows = Math.max(1, Math.floor(height / 1.15))
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.42) {
            const win = new window.THREE.Mesh(
              new window.THREE.PlaneGeometry(0.22, 0.32),
              new window.THREE.MeshBasicMaterial({
                color: Math.random() > 0.82 ? 0xc9a84c : 0x22897a,
                opacity: Math.random() * 0.6 + 0.25,
                transparent: true,
              })
            )
            win.position.set(-width / 2 + 0.45 + c * (width / cols), -height / 2 + 0.9 + r * 1.05, depth / 2 + 0.01)
            mesh.add(win)
          }
        }
      }
    }

    const layout = [
      [-14, 0], [-10, 0], [-6, 0], [-2, 0], [2, 0], [6, 0], [10, 0], [14, 0],
      [-14, -9], [-10, -9], [-6, -9], [2, -9], [6, -9], [10, -9], [14, -9],
      [-14, 9], [-10, 9], [6, 9], [10, 9], [14, 9],
      [-18, -4], [-18, 4], [18, -4], [18, 4], [-22, 0], [22, 0],
    ]

    layout.forEach(([x, z]) => {
      const height = 6 + Math.random() * 14
      const width = 2.5 + Math.random() * 2.2
      building(x + (Math.random() - 0.5) * 1.5, z + (Math.random() - 0.5) * 1.5, width, height, width * 0.85)
    })
    building(0, -2, 4.5, 24, 3.8)

    const starGeo = new window.THREE.BufferGeometry()
    const positions = new Float32Array(800 * 3)
    for (let i = 0; i < 800; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 140
      positions[i * 3 + 1] = 8 + Math.random() * 55
      positions[i * 3 + 2] = (Math.random() - 0.5) * 140
    }
    starGeo.setAttribute('position', new window.THREE.BufferAttribute(positions, 3))
    scene.add(new window.THREE.Points(starGeo, new window.THREE.PointsMaterial({ color: 0x22897a, size: 0.14, transparent: true, opacity: 0.55 })))

    let scrollY = 0
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY
    })

    let tick = 0
    function animate() {
      requestAnimationFrame(animate)
      tick += 0.004
      camera.position.x = Math.sin(tick * 0.28) * 5
      camera.position.z = 34 + scrollY * 0.007
      camera.position.y = 14 - scrollY * 0.004
      camera.lookAt(0, 4, 0)
      gl.intensity = 1.8 + Math.sin(tick * 1.4) * 0.5
      gl2.intensity = 1.2 + Math.cos(tick * 0.9) * 0.3
      renderer.render(scene, camera)
    }
    animate()

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }

  function initVisualPolish() {
    window.addEventListener('scroll', () => {
      document.querySelector('.nav')?.classList.toggle('scrolled', window.scrollY > 20)
    })

    const wrap = $('hero-particles')
    if (wrap && !wrap.dataset.ready) {
      wrap.dataset.ready = 'true'
      const colors = ['rgba(26,107,94,', 'rgba(201,168,76,', 'rgba(42,160,144,']
      for (let i = 0; i < 18; i++) {
        const element = document.createElement('div')
        element.className = 'hero-particle'
        const size = 3 + Math.random() * 6
        const color = colors[Math.floor(Math.random() * colors.length)]
        const opacity = (Math.random() * 0.4 + 0.2).toFixed(2)
        element.style.cssText = `
          width:${size}px;height:${size}px;
          left:${Math.random() * 100}%;
          bottom:${Math.random() * 30}%;
          background:${color}${opacity});
          animation-duration:${6 + Math.random() * 10}s;
          animation-delay:${Math.random() * 8}s;
        `
        wrap.appendChild(element)
      }
    }

    const revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-scale')
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (items) => {
          items.forEach((item, index) => {
            if (item.isIntersecting) setTimeout(() => item.target.classList.add('vis'), index * 60)
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      )
      revealEls.forEach((element) => observer.observe(element))
    }

    setTimeout(() => {
      revealEls.forEach((element) => element.classList.add('vis'))
    }, 400)
  }

  function initAdminFromSession() {
    const token = safeSessionGet(adminTokenKey)
    if (!token) return

    adminToken = token
    showAdminUi()
  }

  function initDeliveryOptions() {
    const whatsappButton = $('d-wa')
    const emailButton = $('d-em')

    if (!whatsappEnabled && whatsappButton) {
      whatsappButton.disabled = true
      whatsappButton.setAttribute('aria-disabled', 'true')
      whatsappButton.setAttribute('title', 'WhatsApp delivery is not available yet')
      whatsappButton.classList.remove('active')
      whatsappButton.style.opacity = '0.45'
      whatsappButton.style.cursor = 'not-allowed'
    }

    if (!whatsappEnabled && emailButton) {
      emailButton.classList.add('active')
    }

    const emailInput = $('lf-email')
    if (!whatsappEnabled && emailInput) {
      emailInput.required = true
      if (emailInput.previousElementSibling?.classList.contains('f-label')) {
        emailInput.previousElementSibling.textContent = 'Email *'
      }
    }
  }

  async function loadAdminStats() {
    try {
      const result = await api('/api/admin/stats', { headers: authHeaders() })
      if (result.success && result.data) {
        setText('admin-total-leads', result.data.overview.totalLeads)
        setText('admin-total-entries', result.data.overview.totalEntries)
        setText('admin-today-entries', result.data.overview.todayEntries)
      }
    } catch (err) {
      console.warn('Failed to load admin stats:', err.message)
    }
  }

  function init() {
    initDeliveryOptions()
    initThreeCity()
    initVisualPolish()
    initAdminFromSession()
    updateAll()
    loadPool({ silent: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
