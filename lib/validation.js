const phonePattern = /^[+\d\s\-()]{7,20}$/

export function validateLead(data) {
  const errors = []
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const phone = typeof data.phone === 'string' ? data.phone.trim() : ''
  const email = typeof data.email === 'string' ? data.email.trim() : ''
  const delivery = data.delivery || 'wa'
  const interest = typeof data.interest === 'string' ? data.interest.trim() : ''
  const npi = typeof data.npi === 'string' ? data.npi.trim() : ''
  const speciality = typeof data.speciality === 'string' ? data.speciality.trim() : ''
  const city = typeof data.city === 'string' ? data.city.trim() : ''
  const state = typeof data.state === 'string' ? data.state.trim() : ''

  if (!name) errors.push({ path: 'name', msg: 'Name is required' })
  if (name && (name.length < 2 || name.length > 100)) {
    errors.push({ path: 'name', msg: 'Name must be 2-100 characters' })
  }

  if (!phone) errors.push({ path: 'phone', msg: 'Phone is required' })
  if (phone && !phonePattern.test(phone)) {
    errors.push({ path: 'phone', msg: 'Invalid phone number' })
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ path: 'email', msg: 'Invalid email address' })
  }

  if (!['wa', 'em'].includes(delivery)) {
    errors.push({ path: 'delivery', msg: 'Delivery must be wa or em' })
  }

  if (interest.length > 200) {
    errors.push({ path: 'interest', msg: 'Interest must be 200 characters or fewer' })
  }

  if (npi && npi.length > 50) {
    errors.push({ path: 'npi', msg: 'NPI must be 50 characters or fewer' })
  }

  if (speciality && speciality.length > 100) {
    errors.push({ path: 'speciality', msg: 'Speciality must be 100 characters or fewer' })
  }

  if (city && city.length > 100) {
    errors.push({ path: 'city', msg: 'City must be 100 characters or fewer' })
  }

  if (state && state.length > 100) {
    errors.push({ path: 'state', msg: 'State must be 100 characters or fewer' })
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      name,
      phone,
      email: email || null,
      delivery,
      interest: interest || null,
      npi: npi || null,
      speciality: speciality || null,
      city: city || null,
      state: state || null,
      source: data.source || 'Event QR Form',
      event: data.event || 'ARD Developers Event 2025',
    },
  }
}

export function maskPhone(phone) {
  return String(phone || '').replace(/\d(?=\d{4})/g, '*')
}
