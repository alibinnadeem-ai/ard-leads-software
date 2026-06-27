import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { error } from '@/lib/http'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

// Maps "Interested In" slugs to the brochure files in /public/PDFs.
const BROCHURE_FILES = {
  'ard-marina': { file: 'A5-Brochure-ARD Marina.pdf', label: 'ARD Marina' },
  'qantara-rivarch': { file: 'A5-Brochure-Qantara Rivarch Commercial.pdf', label: 'Qantara Rivarch' },
  'qantara-commercial': { file: 'A5-Brochure-Qantara Commercial.pdf', label: 'Qantara Commercial' },
  'the-boulevard': { file: 'A5-Brochure-The Boulevard.pdf', label: 'The Boulevard' },
  'green-zone-living': { file: 'A5-Brochure-Green Zone Living.pdf', label: 'Green Zone Living' },
  all: { file: 'Master File.pdf', label: 'All Projects' },
}

export async function GET(request, context) {
  const { slug } = await context.params
  const brochure = BROCHURE_FILES[slug]

  if (!brochure) return error('Brochure not found', 404)

  try {
    const data = await readFile(path.join(process.cwd(), 'public', 'PDFs', brochure.file))
    const filename = `ARD_Developers_${brochure.label.replace(/\s+/g, '_')}.pdf`

    return new Response(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    logger.error(`Brochure file missing: ${brochure.file}`, err)
    return error('Brochure file unavailable', 404)
  }
}
