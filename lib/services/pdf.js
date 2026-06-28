import { jsPDF } from 'jspdf'

export async function generateBrochure(lead, backendUrl) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210
  const H = 297

  const teal = [26, 107, 94]
  const tealL = [34, 137, 122]
  const gold = [201, 168, 76]
  const goldL = [232, 201, 122]
  const dark = [5, 14, 12]
  const white = [240, 245, 244]
  const muted = [120, 160, 150]

  const entry = lead.raffleEntry
  const date = entry?.eventDate || new Date().toISOString().split('T')[0]

  doc.setFillColor(...dark)
  doc.rect(0, 0, W, H, 'F')

  doc.setFillColor(...teal)
  doc.rect(0, 0, W, 44, 'F')

  doc.setFillColor(22, 88, 76)
  doc.roundedRect(13, 9, 26, 26, 3, 3, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ARD', 26, 25, { align: 'center' })

  doc.setFontSize(22)
  doc.text('ARD DEVELOPERS', 46, 20)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 230, 220)
  doc.text('A RUDA-Affiliated Real Estate Development Company', 46, 28)
  doc.setFontSize(7.5)
  doc.setTextColor(170, 210, 200)
  doc.text('Rawalpindi / Lahore, Pakistan - arddevelopers.com', 46, 35)

  doc.setFillColor(...gold)
  doc.rect(0, 44, W, 1.5, 'F')

  doc.setTextColor(...gold)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('THANK YOU,', W / 2, 62, { align: 'center' })

  doc.setTextColor(...white)
  doc.setFontSize(26)
  doc.text(`${lead.name.toUpperCase()}!`, W / 2, 73, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...muted)
  doc.text("You have been registered and entered into today's Lucky Draw.", W / 2, 82, { align: 'center' })
  doc.text('Winners announced at the ARD Developers Booth. Good luck!', W / 2, 88, { align: 'center' })

  doc.setFillColor(...teal)
  doc.rect(13, 96, W - 26, 0.7, 'F')

  doc.setFillColor(12, 20, 18)
  doc.roundedRect(13, 100, W - 26, 56, 4, 4, 'F')
  doc.setFillColor(...teal)
  doc.roundedRect(13, 100, W - 26, 11, 4, 4, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('YOUR REGISTRATION DETAILS', W / 2, 108, { align: 'center' })

  const detailsCol1 = [
    ['Full Name', lead.name],
    ['Phone / WhatsApp', lead.phone],
    ['Email', lead.email || '-'],
    ...(lead.npi ? [['NPI', lead.npi]] : []),
    ...(lead.speciality ? [['Speciality', lead.speciality]] : []),
    [
      'Registered At',
      new Date(lead.createdAt || Date.now()).toLocaleString('en-PK', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    ],
  ]

  const detailsCol2 = [
    ['City', lead.city || '-'],
    ['State', lead.state || '-'],
    ['Interest', lead.interest || '-'],
    ['Entry #', entry?.entryNum ? `#${entry.entryNum}` : '-'],
    ['Event Date', date],
  ]

  let dy1 = 118
  detailsCol1.forEach(([label, value]) => {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...goldL)
    doc.text(label, 18, dy1)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...white)
    const valLines = doc.splitTextToSize(String(value), 50)
    doc.text(valLines, 48, dy1)
    dy1 += 8
  })

  let dy2 = 118
  detailsCol2.forEach(([label, value]) => {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...goldL)
    doc.text(label, 110, dy2)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...white)
    const valLines = doc.splitTextToSize(String(value), 48)
    doc.text(valLines, 140, dy2)
    dy2 += 8
  })

  doc.setFillColor(...teal)
  doc.rect(13, 165, W - 26, 0.7, 'F')

  doc.setTextColor(...gold)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('OUR FLAGSHIP PROJECTS', W / 2, 175, { align: 'center' })

  const projects = [
    {
      name: 'GZL RESIDENTIALS',
      loc: 'RUDA Phase 1, Lahore',
      desc: "Premium residential plots in Lahore's most sought-after RUDA-approved development.",
    },
    {
      name: 'QANTARA COMMERCIALS',
      loc: 'Prime Commercial Hub',
      desc: 'High-ROI commercial units starting PKR 12 Cr. 200-plot Qantara R1 release.',
    },
    {
      name: 'ARD MARINA COMMERCIALS',
      loc: 'Waterfront Commercial',
      desc: 'Iconic waterfront commercial spaces offering premium retail and office opportunities.',
    },
  ]

  let px = 13
  const pW = (W - 26 - 8) / 3

  projects.forEach((proj) => {
    doc.setFillColor(10, 20, 18)
    doc.roundedRect(px, 180, pW, 52, 3, 3, 'F')
    doc.setFillColor(...teal)
    doc.roundedRect(px, 180, pW, 11, 3, 3, 'F')
    doc.setFillColor(...teal)
    doc.rect(px, 186, pW, 5, 'F')

    doc.setTextColor(...white)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(proj.name, px + pW / 2, 187.5, { align: 'center' })

    doc.setTextColor(...goldL)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text(proj.loc, px + pW / 2, 196, { align: 'center' })

    doc.setTextColor(...muted)
    doc.setFontSize(6)
    const lines = doc.splitTextToSize(proj.desc, pW - 6)
    doc.text(lines, px + 3, 202)

    px += pW + 4
  })

  doc.setFillColor(22, 88, 76)
  doc.roundedRect(13, 240, W - 26, 18, 4, 4, 'F')
  doc.setFillColor(...gold)
  doc.rect(13, 240, 3, 18, 'F')
  doc.setTextColor(...gold)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('DOWNLOAD UPDATED BROCHURE ANYTIME', 23, 247)
  doc.setTextColor(...muted)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(`${backendUrl}/api/leads/${lead.id}/pdf`, 23, 253)

  doc.setFillColor(...teal)
  doc.rect(13, 265, W - 26, 0.7, 'F')
  doc.setTextColor(...gold)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('FOLLOW US', W / 2, 273, { align: 'center' })

  const socials = [
    ['Facebook', 'facebook.com/arddevelopers'],
    ['Instagram', '@arddevelopers'],
    ['YouTube', '@ARDCity.Official'],
    ['TikTok', '@arddevelopers'],
    ['Website', 'arddevelopers.com'],
    ['ARD City', 'theardcity.com'],
  ]

  let sx = 13
  let sy = 278
  const sW = (W - 26 - 10) / 3

  socials.forEach(([platform, handle], i) => {
    if (i === 3) {
      sx = 13
      sy = 286
    }
    doc.setFillColor(14, 26, 22)
    doc.roundedRect(sx, sy, sW, 8, 2, 2, 'F')
    doc.setTextColor(...gold)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(platform, sx + 3, sy + 3.5)
    doc.setTextColor(...muted)
    doc.setFont('helvetica', 'normal')
    doc.text(handle, sx + 3, sy + 7)
    sx += sW + 5
  })

  doc.setFillColor(...teal)
  doc.rect(0, H - 18, W, 18, 'F')
  doc.setFillColor(...gold)
  doc.rect(0, H - 18, W, 1, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('ARD DEVELOPERS', W / 2, H - 11, { align: 'center' })
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 230, 220)
  doc.text('Rawalpindi / Lahore, Pakistan | WhatsApp: +92 337 960 9994 | arddevelopers.com', W / 2, H - 5, {
    align: 'center',
  })

  doc.setTextColor(...tealL)
  doc.setFontSize(5.5)
  doc.text(`Entry #${entry?.entryNum || '-'} - Generated: ${new Date().toLocaleString('en-PK')}`, W - 13, H - 0.5, {
    align: 'right',
  })

  const output = doc.output('arraybuffer')
  return Buffer.from(output)
}
