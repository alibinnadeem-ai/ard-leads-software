import { error } from '@/lib/http'

// Maps "Interested In" slugs to the brochure files in /public/PDFs.
const BROCHURE_FILES = {
  'ard-marina': { file: 'A5-Brochure-ARD Marina.pdf', label: 'ARD Marina' },
  'qantara-rivarch': { file: 'A5-Brochure-Qantara Rivarch Commercial.pdf', label: 'Qantara Rivarch' },
  'qantara-commercial': { file: 'A5-Brochure-Qantara Commercial.pdf', label: 'Qantara Commercial' },
  'the-boulevard': { file: 'A5-Brochure-The Boulevard.pdf', label: 'The Boulevard' },
  'green-zone-living': { file: 'A5-Brochure-Green Zone Living.pdf', label: 'Green Zone Living' },
  all: { file: 'Master File.pdf', label: 'All Projects' },
}

// Large PDFs (e.g. the ~36MB master) can't be returned through a serverless function —
// Vercel caps function responses at 4.5MB (413 FUNCTION_PAYLOAD_TOO_LARGE). Instead we
// redirect to the static asset in /public/PDFs, which Vercel's CDN serves directly with
// no size limit. The Content-Disposition header (next.config.mjs) forces the download.
export async function GET(request, context) {
  const { slug } = await context.params
  const brochure = BROCHURE_FILES[slug]

  if (!brochure) return error('Brochure not found', 404)

  return new Response(null, {
    status: 307,
    headers: { Location: `/PDFs/${encodeURIComponent(brochure.file)}` },
  })
}
