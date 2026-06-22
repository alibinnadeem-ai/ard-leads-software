import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPrisma } from '@/lib/prisma'
import { error, appUrl } from '@/lib/http'
import { generateBrochure } from '@/lib/services/pdf'
import { createZip } from '@/lib/services/zip'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

// Maps "Interested In" checkbox slugs to the brochure files in /public/PDFs.
const BROCHURE_FILES = {
  'ard-marina': { file: 'A5-Brochure-ARD Marina.pdf', label: 'ARD Marina' },
  'qantara-rivarch': { file: 'A5-Brochure-Qantara Rivarch Commercial.pdf', label: 'Qantara Rivarch' },
  'qantara-commercial': { file: 'A5-Brochure-Qantara Commercial.pdf', label: 'Qantara Commercial' },
  'the-boulevard': { file: 'A5-Brochure-The Boulevard.pdf', label: 'The Boulevard' },
  'green-zone-living': { file: 'A5-Brochure-Green Zone Living.pdf', label: 'Green Zone Living' },
}

export async function GET(request, context) {
  const { id } = await context.params

  try {
    const lead = await getPrisma().lead.findUnique({
      where: { id },
      include: { raffleEntry: true },
    })

    if (!lead) return error('Lead not found', 404)

    const url = new URL(request.url)
    const slugs = (url.searchParams.get('projects') || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => BROCHURE_FILES[s])

    const safeName = String(lead.name || 'Lead').replace(/\s+/g, '_')
    const files = []

    // Personalized generated PDF (always included).
    const personalized = await generateBrochure(lead, appUrl(request))
    files.push({ name: `ARD_Developers_Brochure_${safeName}.pdf`, data: personalized })

    // Selected project brochures.
    for (const slug of slugs) {
      const { file, label } = BROCHURE_FILES[slug]
      try {
        const data = await readFile(path.join(process.cwd(), 'public', 'PDFs', file))
        files.push({ name: `${label}.pdf`, data })
      } catch (err) {
        logger.error(`Brochure file missing: ${file}`, err)
      }
    }

    const zip = createZip(files)
    const filename = `ARD_Developers_Brochures_${safeName}.zip`

    return new Response(zip, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    logger.error('Bundle generation failed:', err)
    return error('Bundle generation failed', 500)
  }
}
